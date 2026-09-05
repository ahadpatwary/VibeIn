import { ILogger } from "./ILogger";
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export class WinstonLoggerService implements ILogger {
    private readonly prefix = '[RedisService]';

    constructor(private readonly level: LogLevel = 'info') {}

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level.toUpperCase()} ${this.prefix} ${message}${metaStr}`;
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('debug')) {
            console.debug(this.format('debug', message, meta));
        }
    }

    info(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('info')) {
            console.info(this.format('info', message, meta));
        }
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('warn')) {
            console.warn(this.format('warn', message, meta));
        }
    }

    error(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('error')) {
            console.error(this.format('error', message, meta));
        }
    }

    fatal(message: string, meta?: Record<string, unknown>): void {
        if(this.shouldLog('fatal')) {
            console.error(this.format('fatal', message, meta))
        }
    }
}