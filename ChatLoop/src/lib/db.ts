import mongoose from "mongoose";

export const connectToDb = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI_BACKEND ; // 👉 এখানে তোমার MongoDB URL বসাও

    if (!mongoURI) {
      throw new Error("MongoDB URI is missing!");
    }

    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // stop server if DB fails
  }
};