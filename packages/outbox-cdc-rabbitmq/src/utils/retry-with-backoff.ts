export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  /** Called before each retry sleep — good hook for structured logging/metrics. */
  onRetry?: (attempt: number, delayMs: number, err: unknown) => void;
  /** Return false to stop retrying immediately (non-retryable error). Default: always retry. */
  isRetryable?: (err: unknown) => boolean;
}

/** Full-jitter exponential backoff: delay = random(0, min(maxDelay, base * 2^attempt)) */
function computeDelay(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const cappedExponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  return Math.floor(Math.random() * cappedExponential);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper with full-jitter exponential backoff.
 * Mirrors the retryWithBackoff() utility used across the Redis/Kafka modules.
 */
export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, onRetry, isRetryable = () => true } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const attemptsLeft = attempt < maxRetries;
      if (!attemptsLeft || !isRetryable(err)) {
        throw err;
      }

      const delayMs = computeDelay(attempt, baseDelayMs, maxDelayMs);
      onRetry?.(attempt + 1, delayMs, err);
      await sleep(delayMs);
    }
  }

  throw lastError;
}
