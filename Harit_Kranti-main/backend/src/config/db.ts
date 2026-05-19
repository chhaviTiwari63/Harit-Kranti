import mongoose from "mongoose";

/** Short timeouts so startup is not blocked when MongoDB is down or unreachable. */
const MONGO_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

export const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri, MONGO_OPTIONS);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.warn("⚠️ MongoDB connection failed. Running server in local-fallback mode.");
    console.warn(error);
  }
};
