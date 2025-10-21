// models/Message.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;   // sender userId
  receiver: string; // receiver userId
  text: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);