import Redis, { RedisOptions } from 'ioredis';
import { type RedisConfig } from './types/redis.types.js';
import { REDIS_EVENTS } from './constants/redis.constants.js';
import { RedisConnectionException } from './exceptions/redis.exception.js';
import { ILogger } from './utils/logger.js';


export class RedisClientManager {
    private redis: Redis;
    private isRedisConnected: boolean = false;

    constructor(
        private config: RedisConfig,
        private readonly logger: ILogger,
    ) {

        const options: RedisOptions = {
            host: this.config.host,
            port: this.config.port,
            username: 'username',
            password: this.config.password,
            db: this.config.db,
            keyPrefix: this.config.keyPrefix,
            connectTimeout: this.config.connectTimeout,
            commandTimeout: this.config.commandTimeout,
            maxRetriesPerRequest: this.config.maxRetriesPerRequest,
            enableReadyCheck: this.config.enableReadyCheck ?? true,
            lazyConnect: this.config.lazyConnect ?? true,
            keepAlive: this.config.keepAlive,
            family: this.config.family,
            retryStrategy:
                this.config.retryStrategy ??
                this.#defaultRetryStrategy.bind(this),
            ...(this.config.tls ? { tls: {} } : {}),
        };

        this.redis = new Redis(options);

        this.#registerEventHandlers(this.redis);
        this.#registerShutdownHooks();
    }

    async getClient(): Promise<Redis> {

        if(this.isRedisConnected) return this.redis;

        try {

            await this.redis.connect();
            this.isRedisConnected = true;

            this.logger.info('Redis connected successfully', {
                host: this.config.host,
                port: this.config.port,
                db: this.config.db,
            });

        } catch (err) {
            throw new RedisConnectionException(err as Error, {
                host: this.config.host,
                port: this.config.port,
            });
        } finally {
            // this.isReidsConnecting = false;
        }

        return this.redis;
    }

    async disconnect(): Promise<void> {
        try {
            await this.redis.quit();

            this.logger.info('Redis disconnected gracefully');
        } catch {
            this.redis.disconnect();
            this.logger.warn('Redis disconnected forcefully');
        } finally {
            // this.client = null;
        }
    }

    #defaultRetryStrategy(times: number): number | null {
        if (times > 10) {
            this.logger.error(
                'Redis max reconnection attempts reached. Giving up.',
            );
            return null;
        }

        const delay = Math.min(times * 100, 3000);

        this.logger.warn(`Redis reconnecting in ${delay}ms...`, {
            attempt: times,
        });

        return delay;
    }

    #registerEventHandlers(client: Redis): void {
        client.on(REDIS_EVENTS.CONNECTING, () => {
            this.logger.info('Redis connecting...');
        });

        client.on(REDIS_EVENTS.WAIT, () => {
            this.logger.info('Redis wait');
        });

        client.on(REDIS_EVENTS.CONNECT, () => {
            this.logger.info('Redis connection established');
        });

        client.on(REDIS_EVENTS.READY, () => {
            this.logger.info('Redis client is ready');
        });

        client.on(REDIS_EVENTS.ERROR, (err: Error) => {
            this.logger.error('Redis error', { error: err.message });
        });

        client.on(REDIS_EVENTS.CLOSE, () => {
            this.logger.warn('Redis connection closed');
        });

        client.on(REDIS_EVENTS.RECONNECTING, () => {
            this.logger.info('Redis reconnecting...');
        });

        client.on(REDIS_EVENTS.END, () => {
            this.logger.warn('Redis connection ended');
        });
    }

    async #registerShutdownHooks(): Promise<void> {
        const shutdown = async (signal: string) => {
            // this.logger.info(`Received ${signal}, initiating Kafka graceful shutdown`);
            await this.disconnect();
        };
    
        process.once('SIGTERM', () => void shutdown('SIGTERM'));
        process.once('SIGINT', () => void shutdown('SIGINT'));
    }
}