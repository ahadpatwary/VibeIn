import { Socket, Server } from 'socket.io'
import { getRedisClient } from '../../lib/redis';


interface propType {
    groupId: string;
}

export const groupTypingStateHandler = (io: Server, socket: Socket) => {

    socket.on('groupTyping', async ({ groupId }: propType) => {
        
        if(!groupId) return;

        const Redis = getRedisClient();

        if(!Redis) return;
        

        socket.to(`conversation:${groupId}:active`).emit('someoneGroupTyping', groupId);

        const participants = await Redis.lrange(`conversation:${groupId}:participants`, 0, -1);
        const participantRooms = participants.map((id: string) => `user:${id}`);

        io.to(participantRooms).emit('userTyping', groupId);

    })

    socket.on('stopGroupTyping', async({ groupId }: propType) => {

        if(!groupId) return;

        const Redis = getRedisClient();
        if(!Redis) return;

        socket.to(`conversation:${groupId}:active`).emit('someOneStopGroupTyping', groupId);

        
        const participants = await Redis.lrange(`conversation:${groupId}:participants`, 0, -1);
        const participantRooms = participants.map((id: string) => `user:${id}`);
        io.to(participantRooms).emit('userStopTyping', groupId);

    })
}