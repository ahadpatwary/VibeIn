import { Module, Global, DynamicModule } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisService } from './redis.service';
import { RedisLogger } from './utils/redis.logger';
import { REDIS_EVENTS } from './constants/redis.constants';
import { RedisConnectionException } from './exceptions/redis.exception';

import {
  RedisConfig,
} from './types/redis.types';

@Global()
@Module({})
export class RedisModule {

  static forRoot(config: RedisConfig): DynamicModule {

    const optionsProvider = {
      provide: 'REDIS_OPTIONS',
      useValue: config,
    };

    const loggerProvider = {
      provide: 'REDIS_LOGGER',
      useValue: new RedisLogger(),
    };

    const eventsProvider = {
      provide: 'REDIS_EVENTS',
      useValue: REDIS_EVENTS,
    };

    const exceptionProvider = {
      provide: 'REDIS_CONNECTION_EXCEPTION',
      useValue: RedisConnectionException,
    };

    const redisProvider = {
      provide: 'REDIS',
      inject: ['REDIS_OPTIONS'],
      useFactory: async (
        config: RedisConfig,
      ) => {

        // const client = new Redis({
        //   host: config.host,
        //   port: config.port,
        //   password: config.password,
        //   db: config.db,
        //   keyPrefix: config.keyPrefix,
        //   connectTimeout: config.connectTimeout,
        //   commandTimeout: config.commandTimeout,
        //   maxRetriesPerRequest: config.maxRetriesPerRequest,
        //   enableReadyCheck: config.enableReadyCheck ?? true,
        //   lazyConnect: true,
        //   keepAlive: config.keepAlive,
        //   family: config.family,
        //   retryStrategy: config.retryStrategy,
        //   ...(config.tls ? { tls: {} } : {}),
        // });
        const client = new Redis("")

        return client;
      }
    };

    return {
      module: RedisModule,
      global: true,
      providers: [
        optionsProvider,
        loggerProvider,
        eventsProvider,
        exceptionProvider,
        redisProvider,
        RedisService,
      ],
      exports: [RedisService],
    };
  }
}