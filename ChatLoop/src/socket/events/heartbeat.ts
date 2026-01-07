import { Server, Socket } from 'socket.io'
import { getRedisClient } from '../../lib/redis';


export const heartbeatHandler = (io: Server, socket: Socket) => {
    
    // socket.on("heartbeat", (userId: string) => {
    //     try {
    //         const Redis = getRedisClient();
    //         if(!Redis){
    //             socket.emit('error', "Redis connection missing");
    //         }

    //         Redis.set(`user:${userId}`, "online", "EX", 300); // 5 minutes TTL
            
    //     } catch (error) {
    //         if(error instanceof Error) {
    //             socket.emit('error', `message: ${error.message}`);
    //         }
    //     }
    // });
}