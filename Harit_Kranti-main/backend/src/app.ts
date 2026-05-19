import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";

import pestRoutes from "./routes/pestRoutes";
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form-data / file uploads
app.use(morgan("dev"));

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Lightweight health check (works even when MongoDB is in fallback mode)
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Routes
app.use("/api/pest", pestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/market", marketRoutes);

// Global error handler
app.use(errorHandler);

export default app;
