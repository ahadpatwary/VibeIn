import { Module, Global, DynamicModule } from '@nestjs/common';
import { RedisService } from './redis.service';

import {
  RedisConfig,
} from './types/redis.types';

export interface RabbitMqModuleOptions {
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}

export interface RabbitMqModuleFactoryOptions {
  uri: string,
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}

export interface RabbitMqModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<RabbitMqModuleFactoryOptions> | RabbitMqModuleFactoryOptions;
  inject?: any[];
}


@Global()
@Module({})
export class RedisModule {

  static forRoot(options: RabbitMqModuleAsyncOptions): DynamicModule {

    const redisProvider = {
      provide: 'REDIS_OPTIONS',
      inject: options.inject,
      useFactory: options.useFactory,
    };

    return {
      module: RedisModule,
      global: true,
      providers: [
        redisProvider,
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}