import { REDIS_ERRORS } from '../constants/redis.constants';

export class RedisException extends Error {
    public readonly code: string;
    public readonly originalError?: Error;
    public readonly context?: Record<string, unknown>;

    constructor(
        message: string,
        code: string,
        originalError?: Error,
        context?: Record<string, unknown>,
    ) {
        super(message);
        this.name = 'RedisException';
        this.code = code;
        this.originalError = originalError;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            originalError: this.originalError?.message,
            stack: this.stack,
        };
    }
}

export class RedisConnectionException extends RedisException {
    constructor(originalError?: Error, context?: Record<string, unknown>) {
        super(
            `Redis connection failed: ${originalError?.message ?? 'Unknown error'}`,
            REDIS_ERRORS.CONNECTION_FAILED,
            originalError,
            context,
        );
        this.name = 'RedisConnectionException';
    }
}

export class RedisCommandException extends RedisException {
    public readonly command: string;

    constructor(
        command: string,
        originalError?: Error,
        context?: Record<string, unknown>,
    ) {
        super(
            `Redis command '${command}' failed: ${originalError?.message ?? 'Unknown error'}`,
            REDIS_ERRORS.COMMAND_FAILED,
            originalError,
            { command, ...context },
        );
        this.name = 'RedisCommandException';
        this.command = command;
    }
}

export class RedisTimeoutException extends RedisException {
    constructor(
        command: string,
        timeoutMs: number,
        context?: Record<string, unknown>,
    ) {
        super(
            `Redis command '${command}' timed out after ${timeoutMs}ms`,
            REDIS_ERRORS.TIMEOUT,
            undefined,
            { command, timeoutMs, ...context },
        );
        this.name = 'RedisTimeoutException';
    }
}

export class RedisLockException extends RedisException {
    constructor(
        key: string,
        action: 'acquire' | 'release',
        originalError?: Error,
        context?: Record<string, unknown>,
    ) {
        const code =
            action === 'acquire'
                ? REDIS_ERRORS.LOCK_ACQUISITION_FAILED
                : REDIS_ERRORS.LOCK_RELEASE_FAILED;
        super(
            `Redis lock ${action} failed for key '${key}': ${originalError?.message ?? 'Lock not available'}`,
            code,
            originalError,
            { key, action, ...context },
        );
        this.name = 'RedisLockException';
    }
}

export class RedisSerializationException extends RedisException {
    constructor(
        action: 'serialize' | 'deserialize',
        originalError?: Error,
        context?: Record<string, unknown>,
    ) {
        const code =
            action === 'serialize'
                ? REDIS_ERRORS.SERIALIZATION_ERROR
                : REDIS_ERRORS.DESERIALIZATION_ERROR;
        super(
            `Redis ${action} failed: ${originalError?.message ?? 'Unknown error'}`,
            code,
            originalError,
            context,
        );
        this.name = 'RedisSerializationException';
    }
}

export class RedisNotInitializedException extends RedisException {
    constructor() {
        super(
            'Redis client is not initialized. Call connect() first.',
            REDIS_ERRORS.NOT_INITIALIZED,
        );
        this.name = 'RedisNotInitializedException';
    }
}
