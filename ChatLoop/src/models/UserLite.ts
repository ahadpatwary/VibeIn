import mongoose, { Schema, Document } from "mongoose";

export interface IUserLite extends Document {
  name: string;
  picture: {
    url: string;
    public_id: string;
  };
}



const userLiteSchema = new Schema<IUserLite>(
  {
    name: { type: String, required: true },
    picture: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  },
  { collection: "users" } // ✅ MongoDB collection name
);

// ✅ register only if not already registered
const User =
  mongoose.models.User || mongoose.model<IUserLite>("User", userLiteSchema);

export default User;