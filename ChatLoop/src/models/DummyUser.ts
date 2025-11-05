import mongoose, { Schema, Document } from "mongoose";

interface IUserLite extends Document {
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
  { collection: "users" } // 👈 গুরুত্বপূর্ণ: original collection এর নাম দাও
);

const User = mongoose.models.User || mongoose.model<IUserLite>("User", userLiteSchema);

export default User;