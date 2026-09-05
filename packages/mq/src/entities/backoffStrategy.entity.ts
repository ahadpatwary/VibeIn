import { RetryConfig } from '../types/mq.types.js';

export class BackoffStrategy {
    private readonly maxAttempts: number;
    private readonly initialDelay: number;
    private readonly multiplier: number;
    private readonly maxDelay: number;
    private readonly jitter: boolean;

    constructor(config: Required<RetryConfig>) {
        this.maxAttempts = config.maxAttempts;
        this.initialDelay = config.initialDelay;
        this.multiplier = config.multiplier;
        this.maxDelay = config.maxDelay;
        this.jitter = config.jitter;
    }

    /** Returns delay (ms) for the given attempt number (1-based). */
    getDelay(attempt: number): number {
        // Exponential: initialDelay * multiplier^(attempt-1)
        const exp = Math.pow(this.multiplier, attempt - 1);
        let delay = Math.min(this.initialDelay * exp, this.maxDelay);

        if (this.jitter) {
            // Full jitter: random between [0, delay]  (reduces thundering-herd)
            delay = Math.random() * delay;
        }

        return Math.floor(delay);
    }

    /** True when we should give up and route to DLQ. */
    shouldGiveUp(attempt: number): boolean {
        return attempt >= this.maxAttempts;
    }

    /** Sleep helper. */
    async wait(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxAttempts: 5,
    initialDelay: 1_000,
    multiplier: 2,
    maxDelay: 60_000,
    jitter: true,
};
