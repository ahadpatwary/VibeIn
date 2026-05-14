import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

import Redis from 'ioredis';

import { type RedisConfig } from './types/redis.types';
import { type Logger } from './utils/redis.logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {

    private isConnected = false;

    constructor(
        @Inject('REDIS')
        private readonly client: Redis,

        @Inject('REDIS_OPTIONS')
        private readonly config: RedisConfig,

        @Inject('REDIS_LOGGER')
        private readonly logger: Logger,

        @Inject('REDIS_EVENTS')
        private readonly events: Record<string, string>,

        @Inject('REDIS_CONNECTION_EXCEPTION')
        private readonly RedisConnectionException: new (
            err: Error,
            context?: any,
        ) => any,

    ) {}

    async onModuleInit() {
        try {

            this.registerEventHandlers(this.client);

            await this.client.connect();

            this.isConnected = true;

            this.logger.info('Redis connected successfully', {
                host: this.config.host,
                port: this.config.port,
            });

        } catch (err) {

            this.isConnected = false;

            throw new this.RedisConnectionException(
                err as Error,
                { 
                    host: this.config.host,
                    port: this.config.port,
                },
            );
        }
    }

    async onModuleDestroy() {

        try {

            await this.client.quit();

            this.isConnected = false;

            this.logger.info(
                'Redis disconnected gracefully',
            );

        } catch {

            this.client.disconnect();

            this.isConnected = false;

            this.logger.warn(
                'Redis disconnected forcefully',
            );
        }
    }

    getClient(): Redis {
        return this.client;
    }

    get connected(): boolean {
        return this.isConnected;
    }

    private registerEventHandlers(
        client: Redis,
    ): void {

        client.on(this.events.CONNECT, () => {
            this.isConnected = true;
            this.logger.info(
                'Redis connection established',
            );
        });

        client.on(this.events.READY, () => {
            this.logger.info(
                'Redis client ready',
            );
        });

        client.on(this.events.ERROR, (err) => {
            this.logger.error(
                'Redis error',
                {
                    error: err.message,
                },
            );
        });

        client.on(this.events.CLOSE, () => {
            this.isConnected = false;
            this.logger.warn(
                'Redis connection closed',
            );
        });

        client.on(this.events.RECONNECTING, () => {
            this.logger.warn(
                'Redis reconnecting...',
            );
        });

        client.on(this.events.END, () => {
            this.isConnected = false;
            this.logger.warn(
                'Redis connection ended',
            );
        });
    }
}