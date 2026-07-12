import { Inject, Injectable } from "@nestjs/common";
import { ILogger } from "./ILogger";

@Injectable()
export class CustomLoggerService {

    constructor(
        @Inject(ILogger)
        private readonly logger: ILogger,
    ) {}

    info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug?.(message, meta);
    }
    
    error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(message, meta);
    }

    fatal(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(message, meta);
    }

}