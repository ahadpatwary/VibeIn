// database.module.ts
import { Global, Module, DynamicModule } from '@nestjs/common';
import { DATABASE_OPTIONS, DB_CLIENT } from './database/constants';
import { DatabaseOptions } from './types';
import { createDrizzleClient } from './drizzle.provider';

export interface DatabaseAsyncOptions {
  useFactory: (...args: any[]) =>
    Promise<DatabaseOptions> | DatabaseOptions;
  inject?: any[];
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_OPTIONS,
          useValue: options,
        },
        {
          provide: DB_CLIENT,
          useFactory: (opts: DatabaseOptions) => {
            return createDrizzleClient(opts);
          },
          inject: [DATABASE_OPTIONS],
        },
      ],
      exports: [DB_CLIENT],
    };
  }

  static forRootAsync(options: DatabaseAsyncOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        {
          provide: DB_CLIENT,
          useFactory: (opts: DatabaseOptions) => {
            return createDrizzleClient(opts);
          },
          inject: [DATABASE_OPTIONS],
        },
      ],
      exports: [DB_CLIENT],
    };
  }
}