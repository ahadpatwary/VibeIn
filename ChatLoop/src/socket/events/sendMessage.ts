import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";
import Message from "../../models/Message";

interface objectType {
    sender: string,
    receiver: string,
    text: string
}

export const sendMessageHandler = async (io: Server, socket: Socket) => {

    try {

        socket.on('sendMessage', async (data) => {

        const { sender, receiver, text }: objectType = data;

        if(!sender || !receiver || !text) return ;

        const message = await Message.create(data);
        console.log(message);
        
        const receiverSocketId = activeUsers[receiver];
        console.log(receiverSocketId);

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