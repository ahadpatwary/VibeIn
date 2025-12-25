import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";
import Message from "../../models/Message";
import Conversation from "../../models/Conversations";
import { Types } from 'mongoose'

interface objectType {
    sender: string,
    receiver: string,
    text: string
}

export const sendMessageHandler = async (io: Server, socket: Socket) => {

    try {

        socket.on('sendMessage', async (data: objectType) => {

            const { sender, receiver, text }: objectType = data;

            if(!sender || !receiver || !text) return ;

            const message = await Message.create(data);

            const existingConversation = await Conversation.findOne({
                // $or: [
                //     { senderId: sender, receiverId: new Types.ObjectId(receiver) },
                //     { senderId: receiver, receiverId: new Types.ObjectId(sender) }
                // ]
                $and: [
                    { type: 'oneToOne' },
                    { participants: { $all: [new Types.ObjectId(sender), new Types.ObjectId(receiver)] } }
                ]
            });

            let conversation;

            if (!existingConversation) {
                // নতুন conversation তৈরি করো
                conversation = new Conversation({
                    // senderId: sender,
                    // receiverId: new Types.ObjectId(receiver),
                    type: 'oneToOne',
                    participants: [new Types.ObjectId(sender), new Types.ObjectId(receiver)],
                    lastMessage: text,
                    lastMessageTime: new Date()
                });
                await conversation.save();
            } else {
                // আগের conversation update করো
                conversation = existingConversation;
                conversation.lastMessage = text;
                conversation.lastMessageTime = new Date();
                await conversation.save();
            }
            
            const receiverSocketId = activeUsers[receiver];

            if(receiverSocketId){
                io.to(receiverSocketId)
                    .emit('getMessage', message)
                ;
            }

        })
    } catch (error) {
        console.error("❌ Error saving message:", error);
    }
}