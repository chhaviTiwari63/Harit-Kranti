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
    console.error("❌ MongoDB Atlas/local connection failed. Error details:", error);
    console.warn("⚠️ Attempting to start in-memory MongoDB database fallback...");
    try {
      // Dynamically load mongodb-memory-server to avoid loading overhead when not needed
      const { MongoMemoryServer } = require("mongodb-memory-server");
      // Use MongoDB version 4.4.24 which is much smaller and downloads significantly faster
      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: "4.4.24"
        }
      });
      const fallbackUri = mongoServer.getUri();
      console.log(`ℹ️ In-Memory MongoDB Server started on ${fallbackUri}`);
      await mongoose.connect(fallbackUri, MONGO_OPTIONS);
      console.log("✅ Successfully connected to In-Memory MongoDB fallback database!");
    } catch (fallbackError) {
      console.error("❌ Failed to start and connect to In-Memory MongoDB database:", fallbackError);
      console.warn("⚠️ Running server without a working database connection. DB operations will fail.");
    }
  }
};

