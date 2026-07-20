import { Inject, Injectable, Logger } from '@nestjs/common';
import { Resend, type CreateEmailOptions, type CreateEmailResponseSuccess } from 'resend';
import { mapResendErrorResponse, mapResendThrownError } from './map-resend-error';
import { ResendException, ResendUnknownException } from './resend.exceptions';

export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
}

const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 300,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Never log a full email address — only enough to correlate in logs without leaking PII. */
function redactRecipient(to: CreateEmailOptions['to']): string {
  const list = Array.isArray(to) ? to : [to];
  return list
    .map((addr) => {
      const raw = typeof addr === 'string' ? addr : addr.email;
      const [, domain] = raw.split('@');
      return domain ? `***@${domain}` : '***';
    })
    .join(', ');
}

@Injectable()
export class ResendEmailService {
  private readonly logger = new Logger(ResendEmailService.name);

  constructor(
    @Inject(RESEND_CLIENT) private readonly client: Resend,
    private readonly retryConfig: RetryConfig = DEFAULT_RETRY,
  ) {}

  /**
   * Sends an email. Retries automatically on transient failures
   * (rate limit, 5xx, network errors) with exponential backoff.
   * Throws a typed ResendException on final failure — never the raw
   * Resend `error` object or a generic Error.
   */
  async send(payload: CreateEmailOptions): Promise<CreateEmailResponseSuccess> {
    const recipientLabel = redactRecipient(payload.to);
    let lastError: ResendException | undefined;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const { data, error } = await this.client.emails.send(payload);

        if (error) {
          throw mapResendErrorResponse(error);
        }
        if (!data) {
          // Defensive — SDK contract guarantees one of data/error, but don't trust it blindly.
          throw new ResendUnknownException('Resend returned neither data nor error');
        }

        this.logger.log(
          `Email sent id=${data.id} to=${recipientLabel} subject="${payload.subject}"`,
        );
        return data;
      } catch (err) {
        const mapped = mapResendThrownError(err);
        lastError = mapped;

        const isLastAttempt = attempt === this.retryConfig.maxAttempts;
        if (!mapped.retryable || isLastAttempt) {
          this.logger.error(
            `Email send failed permanently to=${recipientLabel} code=${mapped.code} attempt=${attempt}`,
            mapped.stack,
          );
          throw mapped;
        }

        const delay = this.retryConfig.baseDelayMs * 2 ** (attempt - 1);
        this.logger.warn(
          `Email send failed (retrying) to=${recipientLabel} code=${mapped.code} attempt=${attempt} delayMs=${delay}`,
        );
        await sleep(delay);
      }
    }

    // Unreachable in practice — loop always returns or throws.
    throw lastError ?? new ResendUnknownException('Email send failed with no captured error');
  }
}