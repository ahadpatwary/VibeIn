// import { createClient } from "redis";

// export const redis = createClient({
//     username: 'default',
//     password: 'dMsgLtMXOOr63uImKl4t5O4jtUE7lJmh',
//     socket: {
//         host: 'redis-19611.c321.us-east-1-2.ec2.cloud.redislabs.com',
//         port: 19611
//     }
// });

// redis.on("error", () => console.log("Redis Error:"));

// (async () => {
//   if (!redis.isOpen) {
//     try {
//       await redis.connect();
//       console.log("Redis connected successfully!");
//     } catch (err) {
//       console.log("Redis connection failed:", err);
//     }
//   }
// })();

import Redis from 'ioredis';

let redisClient: Redis | null = null;


export const connectToRedis = () => {
    try {
        // const redis = new Redis({
        //     host: process.env.REDIS_HOST || 'localhost',
        //     port: parseInt(process.env.REDIS_PORT || '6379'),
        //     password: process.env.REDIS_PASSWORD,
        // });
        const redis = new Redis("rediss://default:Ad9AAAIncDEyNGU2OWMzZGM2NDM0YTZkYmEwYmY0ZjA4MGVhMjIzYnAxNTcxNTI@driven-lionfish-57152.upstash.io:6379");
        return redis;
    } catch (error) {
        if(error instanceof Error)
            throw new Error(error.message)
        ;
        return null;
    }
}

export const getRedisClient = () => {
    if (!redisClient) { 
        redisClient = connectToRedis();
    }
    return redisClient;
}

export const disconnectFromRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
};