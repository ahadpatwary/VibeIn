import { Module, Global, DynamicModule, Inject } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface RedisModuleOptions {
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}

export interface RedisModuleFactoryOptions {
  uri: string,
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}


export interface RedisModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<RedisModuleFactoryOptions> | RedisModuleFactoryOptions;
  inject?: any[];
}


@Global()
@Module({})
export class RedisModule {
  static forRoot(uri: string, options?: RedisModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: 'REDIS_OPTIONS',
      useValue: {
        uri,
        ...options
      }
    }

    return {
      module: RedisModule,
      providers: [optionsProvider, RedisService],
      exports: [RedisService]
    }
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const asyncOptionProvider = {
      provide: 'REDIS_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject ?? []
    }

    return {
      module: RedisModule,
      providers: [asyncOptionProvider, RedisService],
      exports: [RedisService],
      global: true,
    };
  }
}