import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // global variable declare
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

// Use existing cache or create new
const cached: MongooseCache = global._mongoose ?? { connection: null, promise: null };
global._mongoose = cached;

export async function connectToDb(): Promise<typeof mongoose> {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("❌ Missing MONGODB_URI in .env");

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ MongoDB Connected");
      return mongoose;
    });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}