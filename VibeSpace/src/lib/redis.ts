import { createClient } from "redis";

export const redis = createClient({
    username: 'default',
    password: 'dMsgLtMXOOr63uImKl4t5O4jtUE7lJmh',
    socket: {
        host: 'redis-19611.c321.us-east-1-2.ec2.cloud.redislabs.com',
        port: 19611
    }
});

redis.on("error", () => console.log("Redis Error:"));

(async () => {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      console.log("Redis connected successfully!");
    } catch (err) {
      console.log("Redis connection failed:", err);
    }
  }
})();
