export interface DatabaseConfig {
    uri: string;
    dbName?: string;
    maxPoolSize?: number;
    minPoolSize?: number;
    connectTimeoutMS?: number;
    socketTimeoutMS?: number;
    serverSelectionTimeoutMS?: number;
    retryWrites?: boolean;
    autoIndex?: boolean;
    /** Our own connection-attempt retry loop (separate from the driver's internal replica-set retries) */
    maxConnectionRetries?: number;
    maxCommandRetries?: number;
    retryStrategy?: (attempt: number) => number | null;
}

export interface RetryConfig {
    /** Max delivery attempts before routing to DLQ (default: 5) */
    maxAttempts?: number;
    /** Initial backoff delay in ms (default: 1000) */
    initialDelay?: number;
    /** Backoff multiplier per attempt (default: 2) */
    multiplier?: number;
    /** Max delay cap in ms (default: 60_000) */
    maxDelay?: number;
    /** Add jitter to avoid thundering herd (default: true) */
    jitter?: boolean;
}

export interface RetryOptions {
    maxAttempts?: number;
    initialDelay?: number;
    multiplier?: number;
    maxDelay?: number;
    jitter?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
}