import { LOGGER_TOKENS, LoggerFactory, registerLogger } from '@app/logger';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { container } from 'tsyringe';

const LOGGER_INITIALIZED = Symbol('LOGGER_INITIALIZED');

@Module({})
export class LoggerModule {
   static forRootAsync(): DynamicModule {
      return {
         module: LoggerModule,

         imports: [ConfigModule],

         providers: [
            {
               provide: LOGGER_INITIALIZED,
               inject: [ConfigService],

               useFactory: (config: ConfigService) => {
                  registerLogger(container, {
                     // I have config access hear
                  });

                  return true;
               },
            },

            {
               provide: LOGGER_TOKENS.LoggerFactory,
               /** logger factory depend on logger initialize */
               inject: [LOGGER_INITIALIZED],
               useFactory: () => container.resolve(LoggerFactory),
            },
         ],

         global: true,

         exports: [LOGGER_TOKENS.LoggerFactory],
      };
   }
}
