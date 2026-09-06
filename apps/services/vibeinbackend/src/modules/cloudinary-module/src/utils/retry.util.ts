import { Logger } from '@nestjs/common';
import { RETRYABLE_HTTP_CODES } from '../constants/cloudinary.constants';
import { extractHttpCode } from './map-cloudinary-error.util';

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  /** Cap so backoff doesn't grow unbounded on many attempts. */
  maxDelayMs?: number;
  operationName: string;
  /** Override the default "is this worth retrying" check. */
  isRetryable?: (err: unknown) => boolean;
}

const logger = new Logger('CloudinaryRetry');

function defaultIsRetryable(err: unknown): boolean {
  const code = extractHttpCode(err);
  if (code !== undefined) return RETRYABLE_HTTP_CODES.has(code);
  // Network-level errors (no http_code) — treat as transient.
  const name = (err as { code?: string })?.code;
  return name === 'ECONNRESET' || name === 'ETIMEDOUT' || name === 'ECONNREFUSED';
}

function delayWithJitter(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  const exponential = baseDelayMs * 2 ** (attempt - 1);
  const capped = Math.min(exponential, maxDelayMs);
  // Full jitter: random value in [0, capped] avoids thundering-herd retries.
  return Math.floor(Math.random() * capped);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs `fn`, retrying transient failures with exponential backoff + full
 * jitter. Non-retryable errors (validation, 404, auth) are rethrown
 * immediately on first failure — retrying those only wastes time.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    maxDelayMs = 10_000,
    operationName,
    isRetryable = defaultIsRetryable,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = isRetryable(err);

      if (!retryable || attempt === maxAttempts) {
        logger.warn(
          `${operationName} failed on attempt ${attempt}/${maxAttempts} (retryable=${retryable}) — giving up: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        throw err;
      }

      const delay = delayWithJitter(attempt, baseDelayMs, maxDelayMs);
      logger.warn(
        `${operationName} failed on attempt ${attempt}/${maxAttempts} — retrying in ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  // Unreachable, but keeps TS happy.
  throw lastError;
}
