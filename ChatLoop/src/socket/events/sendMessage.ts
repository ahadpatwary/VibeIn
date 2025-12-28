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


            // if(){ //conversation only redis exists
            //     //conversation top priority on redis 
            // }else if(){ // conversation only db exists
            //     // db থেকে conversation নিয়ে আসো এবং redis এ save করো top priority হিসেবে
            //     //conversation remove from DB.
            // }else{ // conversation not exists in both
            //     // shudu conversation save redis as a top priority
            // }

            const existingConversation = await Conversation.findOne({
                $and: [
                    { type: 'oneToOne' },
                    { participants: { $all: [new Types.ObjectId(sender), new Types.ObjectId(receiver)] } }
                ]
            });

            let conversation;

            if (!existingConversation) {
                // নতুন conversation তৈরি করো
                // conversation = new Conversation({
                //     type: 'oneToOne',
                //     participants: [new Types.ObjectId(sender), new Types.ObjectId(receiver)],
                //     lastMessage: text,
                //     lastMessageTime: new Date()
                // });
                // await conversation.save();

                //conversation not exists in Db



            } else {
                // আগের conversation update করো
                // conversation = existingConversation;
                // conversation.lastMessage = text;
                // conversation.lastMessageTime = new Date();
                // await conversation.save();

                //conversation already exists in Db


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


// https://courses.chaicode.com/learn