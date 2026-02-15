import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';

export interface RabbitMqModuleOptions {
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}

export interface RabbitMqModuleAsyncOptions {
  useFactory: () => Promise<RabbitMqModuleOptions> | RabbitMqModuleOptions;
  inject?: any[];
}

@Global()
@Module({})
export class RabbitMqModule {
  static forRoot(uri: string, options?: RabbitMqModuleOptions): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'RABBITMQ_OPTIONS',
      useValue: {
        uri,
        ...options
      }
    };

    return {
      module: RabbitMqModule,
      providers: [optionsProvider, RabbitMqService],
      exports: [RabbitMqService],
      global: true,
    };
  }

  // Optional for multiple queue feature
  static forFeature(): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [],
      exports: [RabbitMqService],
      global: true,
    };
  }
}
