import { Global, Logger, Module } from '@nestjs/common';
import { ILogger } from './ILogger';
import { CustomLoggerService } from './logger.service';
import { WinstonLoggerService } from './winston-logger.service';


@Global()
@Module({
    providers: [
        // { provide: ILogger, useClass: WinstonLoggerService },
        // CustomLoggerService,

        { provide: ILogger, useClass: Logger },
        CustomLoggerService, 
    ],
    exports: [CustomLoggerService],
})

export class LoggerModule {}