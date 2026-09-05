import { Global, Module, DynamicModule } from '@nestjs/common';
import { DatabaseConfig } from './types/database.types';
import { DatabaseService } from './database.service';
import { DatabaseLogger } from './utils/database.logger';
import { DATABASE_EVENTS } from './constants/database.constants';
import { ConnectionError } from './exceptions/database.exceptions';



// export interface DatabaseAsyncOptions {
//   useFactory: (...args: any[]) =>
//     Promise<DatabaseOptions> | DatabaseOptions;
//   inject?: any[];
// }

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig ): DynamicModule {

    const optionsProvider = {
      provide: 'DATABASE_CONFIG',
      useValue: config,
    };

    const loggerProvider = {
      provide: 'DATABASE_LOGGER',
      useValue: new DatabaseLogger(),
    };

    const eventsProvider = {
      provide: 'DATABASE_EVENTS',
      useValue: DATABASE_EVENTS,
    };

    const exceptionProvider = {
      provide: 'DATABASE_CONNECTION_EXCEPTION',
      useValue: ConnectionError,
    };



    return {
      module: DatabaseModule,
      global: true,
      providers: [
        optionsProvider,
        loggerProvider,
        eventsProvider,
        exceptionProvider,
        DatabaseService,
      ],
      exports: [DatabaseService],
    };
  }

  // static forRootAsync(options: DatabaseAsyncOptions): DynamicModule {
  //   return {
  //     module: DatabaseModule,
  //     providers: [
  //       {
  //         provide: DATABASE_OPTIONS,
  //         useFactory: options.useFactory,
  //         inject: options.inject || [],
  //       },
  //       {
  //         provide: DB_CLIENT,
  //         useFactory: (opts: DatabaseOptions) => {
  //           return createDrizzleClient(opts);
  //         },
  //         inject: [DATABASE_OPTIONS],
  //       },
  //     ],
  //     exports: [DB_CLIENT],
  //   };
  // }
}