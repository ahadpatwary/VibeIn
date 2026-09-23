import Redis, { ChainableCommander } from 'ioredis';
import { RedisPipelineResult } from './types/redis.types.js';
import { type RedisClientManager } from './redis.client.js';
import { RedisCommandException } from './exceptions/redis.exception.js';
import { inject, injectable } from 'tsyringe';
import { REDIS_TOKENS } from './tokens/redis.token.js';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';

@injectable()
export class RedisService {
    private readonly logger: ILogger;

    constructor(
        @inject(REDIS_TOKENS.RedisClientManager)
        private readonly client: RedisClientManager,
        @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
    ) {
        this.logger = factory.forModule('RedisModule');
    }

    async commandWraper<T>( 
        command: string,
        fn: (client: Redis) => Promise<T>,
    ): Promise<T> {
        const client = await this.client.getClient();

        try {
            return await fn(client);
        } catch (err) {
            this.logger.error(`Redis command error`, err, {
                command: command,
            } )
            
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
