import Redis from 'ioredis';

let redisClient: Redis | null = null;


export const connectToRedis = () => {
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
        });
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