import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
    senderId: string,
    receiverId: string,
    lastMessage: string,
    lastMessageTime: Date,
}


const ConversationSchema = new Schema<IConversation>(
    {
        senderId: {
            type: String,
            required: true,
        },
        receiverId: {
            type: String,
            required: true,
        },
        lastMessage: {
            type: String,
        },
        lastMessageTime: {
            type: Date,
        }

    }, { timestamps: true}
)


const Conversation =  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;