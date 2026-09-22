export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
  isRetryable?: (error: unknown) => boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
  const jitter = Math.random() * exponential * 0.5;
  return Math.round(exponential * 0.5 + jitter);
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, baseDelayMs, maxDelayMs, onRetry, isRetryable } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const canRetry = isRetryable ? isRetryable(error) : true;
      if (!canRetry || attempt === attempts) throw error;

      const delayMs = computeBackoff(attempt, baseDelayMs, maxDelayMs);
      onRetry?.(attempt, error, delayMs);
      await delay(delayMs);
    }
  }

  throw lastError;
}

export function Retryable(options: Partial<RetryOptions> = {}) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      return withRetry(() => original.apply(this, args), {
        attempts: options.attempts ?? 3,
        baseDelayMs: options.baseDelayMs ?? 200,
        maxDelayMs: options.maxDelayMs ?? 5000,
        onRetry: options.onRetry,
        isRetryable: options.isRetryable,
      });
    };
    return descriptor;
  };
}
