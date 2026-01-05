import { Server, Socket } from "socket.io";
import { activeUsers } from "../activeUsers";
import { getRedisClient } from "../../lib/redis";



export const addUserHandler = (io: Server, socket: Socket) => {
    
    socket.on('addUser', async (userId: string) => {

        const Redis = getRedisClient();
        if(!Redis) return;

        await Redis.set(`user:online:${userId}`, "1", "EX", 300); // string
        await Redis.sadd("online:users", userId); //set because set element can't expire

        setInterval(async () => {
            const userIds = await Redis.smembers("online:users");

            const pipeline = Redis.pipeline();
            userIds.forEach((id: string) =>
                pipeline.exists(`user:online:${id}`)
            );

            const results = await pipeline.exec();

            const activeUsers = results && userIds.filter(
                (_, i) => results[i][1] === 1
            );

            io.to("allUserOnlineStatues").emit("onlineUser", activeUsers);

        }, 5 * 60 * 1000);

        activeUsers[userId] = socket.id;
        io.emit('getUsers', Object.keys(activeUsers));
    })
}