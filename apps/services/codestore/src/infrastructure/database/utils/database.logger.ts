import chalk from "chalk";

export type LogLevel = 'error' | 'warn'  | 'info' | 'debug';

export interface Logger {
    error(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}

export class DatabaseLogger implements Logger {
    private readonly prefix = '[DatabaseService]';

    constructor(private readonly level: LogLevel = 'info') {}

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[APP] ${chalk.yellow(timestamp)} ${level.toUpperCase()} ${this.prefix} ${chalk.cyan(message)}${chalk.grey(metaStr)}`;
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('debug')) {
            console.debug(this.format('debug', message, meta));
        }
    }

    info(message: string, meta?: Record<string, unknown>): void {
        if (this.shouldLog('info')) {
            // console.info(this.format('info', message, meta));
            console.log(chalk.green(this.format('info', message, meta)));
            
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