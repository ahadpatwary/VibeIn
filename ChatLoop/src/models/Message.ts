import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: string;
  receiver: string;
  text: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true } // ✅ automatically adds createdAt & updatedAt
);

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;