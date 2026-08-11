import Redis, { RedisOptions } from 'ioredis';
import { type RedisConfig } from './types/redis.types';
import { REDIS_EVENTS } from './constants/redis.constants';
import { RedisConnectionException } from './exceptions/redis.exception';
import { ILogger } from './utils/logger';
import { createRedisConfig } from './config/redis.config';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisClient {
    private client: Redis | null = null;
    private isConnecting: boolean = false;

    constructor(
        @Inject('REDIS_OPTIONS')
        private config: RedisConfig, // module e ja pathano hobe
        private readonly logger: ILogger,
    ) {}

    async connect(): Promise<void> {
        if (this.isConnecting)
            throw new RedisConnectionException(
                new Error('Connection attempt already in processing'),
            );

        this.isConnecting = true;

        try {
            await this.createClient.connect();

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
            this.isConnecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (!this.client) return;

        try {
            await this.client.quit();

            this.logger.info('Redis disconnected gracefully');
        } catch {
            this.client.disconnect();
            this.logger.warn('Redis disconnected forcefully');
        } finally {
            this.client = null;
        }
    }

    get getClient(): Redis {
        if (!this.client) {
            throw new RedisConnectionException(
                new Error('Redis client missing'),
            );
        }

        this.connected();

        return this.client;
    }

    private connected(): void {
        if (this.client!.status !== 'ready') {
            throw new RedisConnectionException(
                new Error('Redis connection not ready to push messages'),
            );
        }
    }

    private get createClient(): Redis {
        if (this.client) return this.client;

        this.config = createRedisConfig(this.config);

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
                this.defaultRetryStrategy.bind(this),
            ...(this.config.tls ? { tls: {} } : {}),
        };

        this.client = new Redis(options); // create redis instance

        if (!this.client) {
            throw new RedisConnectionException(
                new Error('Redis client not initialized'),
            );
        }

        this.registerEventHandlers(this.client);

        return this.client;
    }

    private defaultRetryStrategy(times: number): number | null {
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

    private registerEventHandlers(client: Redis): void {
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
}
