import mongoose from "mongoose";

export const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed. Running server in local-fallback mode.");
  }
};
