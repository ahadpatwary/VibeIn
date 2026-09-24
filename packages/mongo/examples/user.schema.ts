// This file lives at APPLICATION level, not inside the package.
// Shown here only as a usage example.
import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
   email: string;
   name: string;
   createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
   {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      name: { type: String, required: true },
   },
   { timestamps: { createdAt: true, updatedAt: true } },
);

export const UserModel = model<UserDocument>('User', userSchema);
