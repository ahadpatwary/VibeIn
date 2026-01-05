import { Server } from "socket.io";
import { getRedisClient } from "../../lib/redis";

let batchInterval: ReturnType<typeof setInterval> | null = null;

export const initPresenceBatch = async (io: Server) => {
  const Redis = getRedisClient();
  if (!Redis) return;

  const LOCK_KEY = "presence:batch:lock";

  const lock = await Redis.set(
    "presence:batch:lock",
    "value",
    "EX",
    600,
    "NX"
 );


  if (!lock) {
    console.log("Another server is running batch job");
    return;
  }

  console.log("This server is batch leader yes");

  batchInterval = setInterval(async () => {
    const userIds = await Redis.smembers("online:users");

    const pipeline = Redis.pipeline();
    userIds.forEach(id =>
      pipeline.exists(`user:online:${id}`)
    );

    const results = await pipeline.exec();

    const activeUsersList =
      results && userIds.filter((_, i) => results[i][1] === 1);

    io.to("allUserOnlineStatues").emit("onlineUser", activeUsersList);

  }, 5 * 60 * 1000);
};
