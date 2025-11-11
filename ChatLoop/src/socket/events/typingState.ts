import { Server, Socket } from 'socket.io'
import { activeUsers } from "../activeUsers";

interface propType {
    receiver: string;
}

export const typingStateHandler = (io: Server, socket: Socket) => {
        
    socket.on('typing', ({ receiver }: propType) => {

        if(!receiver) return;

        const receiverSocketId = activeUsers[receiver];

        if(receiverSocketId){
            io.to(receiverSocketId)
                .emit('someoneTyping')
            ;
        }

    })

    socket.on('stopTyping', ({ receiver }: propType) => {

        if(!receiver) return;

        const receiverSocketId = activeUsers[receiver];

        receiverSocketId && io.to(receiverSocketId)
            .emit('someoneStopTyping')
        ;
        
    })

}