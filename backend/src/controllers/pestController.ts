import { Request, Response } from "express";
import PestResult from "../models/pestResult";
import { getGeminiAdvice } from "../services/geminiService";

// Pest detection function
export const detectPest = async (req: Request, res: Response) => {
  try {
    const { pestDescription } = req.body;

    // Get AI advice from Gemini
    const advice = await getGeminiAdvice(pestDescription);

    // Save to MongoDB
    const result = await PestResult.create({
      description: pestDescription,
      advice,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("❌ Error detecting pest:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch all pest detection history
export const getHistory = async (req: Request, res: Response) => {
  try {
    const history = await PestResult.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Export both functions
export default {
  detectPest,
  getHistory,
};
