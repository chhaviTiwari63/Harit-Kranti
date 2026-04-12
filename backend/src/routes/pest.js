import express from "express";
import { analyzePest } from "../controllers/pestController.js";

const router = express.Router();
router.post("/analyze", analyzePest);

export default router;