import { Module, Global, DynamicModule } from '@nestjs/common';
import { RedisService } from './redis.service';

import { RedisConfig } from './types/redis.types';

export interface RabbitMqModuleOptions {
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
}

export interface RabbitMqModuleFactoryOptions {
    uri: string;
    retryAttempts?: number | undefined;
    retryDelay?: number | undefined;
}

export interface RabbitMqModuleAsyncOptions {
    useFactory: (...args: any[]) => RedisConfig;
    inject?: any[];
}

@Global()
@Module({})
export class RedisModule {
    static forRoot(options: RabbitMqModuleAsyncOptions): DynamicModule {
        const redisOptions = {
            provide: 'REDIS_OPTIONS',
            inject: options.inject,
            useFactory: options.useFactory,
        };

        return {
            module: RedisModule,
            global: true,
            providers: [redisOptions, RedisService],
            exports: [RedisService],
        };
    }
}
