import { Router } from "express";
import multer from "multer";
import { detectPest, getHistory } from "../controllers/pestController";

// Configure multer to store uploaded images temporarily
const upload = multer({ dest: "uploads/" });

const router = Router();

// Pest detection route (handles image upload)
router.post("/detect", upload.single("image"), detectPest);

// Fetch pest detection history
router.get("/history", getHistory);

export default router;
