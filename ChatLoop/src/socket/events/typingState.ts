import { Server, Socket } from 'socket.io'
import { activeUsers } from "../activeUsers";


export const typingStateHandler = (io: Server, socket: Socket) => {
    
    try {
        
        socket.on('typing', async({ receiver }) => {

            if(!receiver) return;

            const receiverSocketId = activeUsers[receiver];

            if(receiverSocketId){
                socket.to(receiverSocketId)
                    .emit('someoneTyping')
                ;
            }

        })

        socket.on('stopTyping', async ({ receiver }) => {

            if(!receiver) return;

            const receiverSocketId = activeUsers[receiver];

            receiverSocketId && socket.to(receiverSocketId)
                .emit('someoneStopTyping')
            ;
            

        })

    } catch (error) {
        if(error instanceof Error){
            console.log(error.message);
        }
    }
}