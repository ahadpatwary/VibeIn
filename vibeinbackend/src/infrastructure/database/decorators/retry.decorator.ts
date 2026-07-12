import { DEFAULT_RETRY_CONFIG } from "../constants/database.constant";
import { RetryConfig, RetryOptions } from "../types/database.type";

export class BackoffStrategy {
    private readonly maxAttempts: number;
    private readonly initialDelay: number;
    private readonly multiplier: number;
    private readonly maxDelay: number;
    private readonly jitter: boolean;

    constructor(config: Required<RetryConfig>) {
        this.maxAttempts = config.maxAttempts,
        this.initialDelay = config.initialDelay,
        this.multiplier = config.multiplier,
        this.maxDelay = config.maxDelay,
        this.jitter = config.jitter
    }

    getDelay(attempt: number): number {
        const exp = Math.pow(this.multiplier, (attempt - 1));
        let delay = Math.min(this.initialDelay * exp, this.maxDelay)

        if(this.jitter) {
            delay = Math.random() * delay;
        }

        return Math.floor(delay)
    }

    async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}


export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
): Promise<T> {
    
    const config = {
        maxAttempts: options.maxAttempts ?? DEFAULT_RETRY_CONFIG.maxAttempts,
        initialDelay: options.initialDelay ?? DEFAULT_RETRY_CONFIG.initialDelay,
        multiplier: options.multiplier ?? DEFAULT_RETRY_CONFIG.multiplier,
        maxDelay: options.maxDelay ?? DEFAULT_RETRY_CONFIG.maxDelay,
        jitter: options.jitter ?? DEFAULT_RETRY_CONFIG.jitter,
        onRetry: options.onRetry
    }

    const backoffStrategy = new BackoffStrategy(config);

    let lastError: Error | undefined;

    for(let attempt = 1; attempt <= config.maxAttempts; attempt++){
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error   

            config.onRetry?.(attempt + 1, lastError);

            if(attempt < config.maxAttempts) {
                const delay = backoffStrategy.getDelay(attempt);
                backoffStrategy.wait(delay)
            }
        }
    }

    throw lastError;
}

export function Retry(options: RetryOptions = {}) {
    return function (
        _target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ): PropertyDescriptor {
        const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

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