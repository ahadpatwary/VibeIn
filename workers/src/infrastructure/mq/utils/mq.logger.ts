export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Default console-based logger. Replace with Winston/Pino in production.
 */
export class RabbitMqLogger implements Logger {
    private readonly prefix = '[RabbitMqService]';

    constructor(private readonly level: LogLevel = 'info') {}

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private format(
        level: LogLevel,
        message: string,
        meta?: Record<string, unknown>,
    ): string {
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
}

/** No-op logger for testing */
export class NoopLogger implements Logger {
    debug(): void {}
    info(): void {}
    warn(): void {}
    error(): void {}
}
