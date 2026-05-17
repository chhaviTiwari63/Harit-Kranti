import dns from "dns";
// Set public DNS servers to bypass local DNS/router issues with MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/haritpath";

const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log("⏳ Connecting to MongoDB...");
    await connectDB(MONGO_URI);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
