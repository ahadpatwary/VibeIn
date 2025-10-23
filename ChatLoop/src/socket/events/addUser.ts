import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";



export const addUserHandler = (io: Server, socket: Socket) => {
    
    socket.on('addUser', (userId: string) => {

        activeUsers[userId] = socket.id;
        io.emit('getUsers', Object.keys(activeUsers));
    })
}