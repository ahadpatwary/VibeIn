import { inject, injectable } from 'tsyringe';
import Redis, { ChainableCommander, ReplyError } from 'ioredis';
import {
    HashScanResult,
    Nullable,
    RedisPipelineResult,
    ScanOptions,
    ScanResult,
    SetOptions,
    ZMember,
    ZRangeOptions,
    type RedisConfig,
} from './types/redis.types.js';
import { type RedisClientManager } from './redis.client.js';
import { RedisSerializer } from './utils/redis.serializer.js';
import { REDIS_CONSTANTS } from './constants/redis.constants.js';
import { RedisCommandException } from './exceptions/redis.exception.js';

@injectable()
export class RedisService {
    constructor(
        @inject('RedisClientManager')
        private readonly client: RedisClientManager,
        @inject('RedisLogger')
        private readonly logger: any, //TODO: Replace 'any' with the actual type of your logger if available
    ) {}

    async commandWraper<T>(
        command: string,
        fn: (client: Redis) => Promise<T>,
    ): Promise<T> {
        const client = await this.client.getClient();

        try {
            return await fn(client);
        } catch (err) {
            if (err instanceof RedisCommandException) throw err;
            throw new RedisCommandException(command, err as Error);
        }

    }


    async pipeline(
        fn: (pipe: ChainableCommander) => void | Promise<void>,
    ): Promise<RedisPipelineResult> {
        return this.commandWraper('PIPELINE', async (client: Redis) => {
            const pipe = client.pipeline();
            await fn(pipe);
            const results = await pipe.exec();
            const errors = (results ?? [])
                .filter(([err]) => err !== null)
                .map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }

    async transaction(
        fn: (pipe: ChainableCommander) => void | Promise<void>,
    ): Promise<RedisPipelineResult> {
        return this.commandWraper('MULTI/EXEC', async (client: Redis) => {
            const multi = client.multi();
            await fn(multi);
            const results = await multi.exec();
            const errors = (results ?? [])
                .filter(([err]) => err !== null)
                .map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }
}
