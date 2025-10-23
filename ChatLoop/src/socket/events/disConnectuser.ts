import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";



export const disConnectUserHandler = (io: Server, socket: Socket) => {
    
    socket.on('disconnect', () => {

        for(let userId in activeUsers){
            if(activeUsers[userId] === socket.id){
                delete activeUsers[userId];
                break;
            }
        }

        io.emit('getUsers', Object.keys(activeUsers));
    })
}