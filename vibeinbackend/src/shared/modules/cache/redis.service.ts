import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export interface optionsType {
    uri: string, 
    retryAttempts?: number | undefined,
    retryDelay?: number | undefined,
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    constructor(
        @Inject('REDIS_OPTIONS') private readonly options: optionsType,
    ) {}

    onModuleInit() {
        this.client = new Redis(this.options.uri, {
            retryStrategy: (times: number) => {
                const attempts = this.options.retryAttempts ?? 5;
                const delay = this.options.retryDelay ?? 3000;

                if (times > attempts) {
                    console.error('Redis retry attempts exceeded');
                    return null;
                }

                return delay;
            },
        });

        this.client.on('connect', () => {
            console.log('Redis connected');
        });

        this.client.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    async onModuleDestroy() {
        if (this.client) {
        await this.client.quit();
            console.log('Redis disconnected');
        }
    }

    getClient(): Redis {
        return this.client;
    }
}