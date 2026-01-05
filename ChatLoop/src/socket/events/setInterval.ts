import { Server } from "socket.io";
import { getRedisClient } from "../../lib/redis";

let batchInterval: number | null = null; // keep reference

export const initPresenceBatch = (io: Server) => {
    const Redis = getRedisClient();
    if (!Redis) return;

    // check if interval already running
    if (!batchInterval) {
        console.log("interval Start");
        batchInterval = setInterval(async () => {
            const userIds = await Redis.smembers("online:users");

            const pipeline = Redis.pipeline();
            userIds.forEach((id: string) =>
                pipeline.exists(`user:online:${id}`)
            );

            const results = await pipeline.exec();

            const activeUsersList = userIds.filter(
                (_, i) => results[i][1] === 1
            );

            io.to("allUserOnlineStatues").emit("onlineUser", activeUsersList);
        }, 5 * 60 * 1000); // 5 min
    }
};