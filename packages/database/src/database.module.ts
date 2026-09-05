import { DynamicModule, Global, Module } from '@nestjs/common';
import { DatabaseConnection } from './database.client';
import { DatabaseService } from './database.service';
import { DatabaseConfig } from './types/database.type';
import { ILogger } from './utils/database.logger';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

export interface DatabaseModuleFactoryOptions {
  uri: string,
  retryAttempts?: number | undefined,
  retryDelay?: number | undefined,
}

export interface DatabaseModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<DatabaseModuleFactoryOptions> | DatabaseModuleFactoryOptions;
  inject?: any[];
}

@Global()
@Module({})
export class DatabaseModule {

    static forRoot(config: DatabaseConfig): DynamicModule { 

        return {

            module: DatabaseModule,

            providers: [
                { provide: ILogger, useClass: CustomLoggerService },
                { 
                    provide: DatabaseConnection,
                    inject: [ILogger],
                    useFactory: (logger: ILogger) => {
                        return new DatabaseConnection(config, logger);
                    },
                },

                DatabaseService,

            ],

            exports: [DatabaseService],
        };

    }

    static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
        const databaseOptions = {
            provide: 'DATABASE_OPTIONS',
            inject: options.inject,
            useFactory: options.useFactory,
        }

        return {
            module: DatabaseModule,
            global: true,
            providers: [
                databaseOptions,
            ],
            exports: [ DatabaseModule ]
        }
    }

}