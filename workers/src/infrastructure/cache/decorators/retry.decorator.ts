import { RedisCommandException } from '../exceptions/redis.exception';
import { REDIS_CONSTANTS } from '../constants/redis.constants';
import { ReplyError } from 'ioredis';

export interface RetryOptions {
    retries?: number;
    delay?: number; // ms
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retries an async function with optional exponential backoff.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
): Promise<T> {
    const {
        retries = REDIS_CONSTANTS.DEFAULT_MAX_RETRIES,
        delay = REDIS_CONSTANTS.DEFAULT_RETRY_DELAY,
        exponentialBackoff = true,
        onRetry,
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastError = err as Error;

            if (attempt < retries) {
                onRetry?.(attempt + 1, lastError);
                const waitTime = exponentialBackoff
                    ? delay * Math.pow(2, attempt)
                    : delay;
                await sleep(waitTime);
            }
        }
    }

    throw lastError;
}

/**
 * Method decorator for automatic retry on failure.
 * Usage: @Retry({ retries: 3, delay: 100 })
 */
export function Retry(options: RetryOptions = {}) {
    return function (
        _target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor {
        const originalMethod = descriptor.value as (
            ...args: unknown[]
        ) => Promise<unknown>;

        descriptor.value = async function (...args: unknown[]) {
            return withRetry(() => originalMethod.apply(this, args), {
                ...options,
                onRetry: (attempt, error) => {
                    options.onRetry?.(attempt, error);
                    console.warn(
                        `[Retry] Method '${propertyKey}' attempt ${attempt} failed: ${error.message}`,
                    );
                },
            });
        };

        return descriptor;
    };
}

/**
 * Wraps a Redis command call with error normalization.
 */
export async function withCommandError<T>(
    command: string,
    fn: () => Promise<T>,
): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        if (err instanceof RedisCommandException) throw err;
        throw new RedisCommandException(command, err as Error);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
