import mongoose, { Schema, Document, Types } from "mongoose";

export interface IConversation extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  lastMessage: string;
  lastMessageTime: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: String },
    lastMessageTime: { type: Date },
  },
  { timestamps: true }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;