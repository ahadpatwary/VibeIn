/**
 * Unified AppError base. Every infra-specific exception hierarchy
 * (Outbox, ChangeStream, RabbitMQ, ...) extends this so upstream
 * handlers can branch on `.code` / `.retryable` without knowing
 * the originating subsystem.
 *
 * Code format: "<NAMESPACE>_<REASON>", e.g. "CDC_RESUME_TOKEN_INVALID"
 */
export abstract class AppError extends Error {
  abstract readonly namespace: string;
  abstract readonly code: string;
  abstract readonly retryable: boolean;

  readonly cause?: unknown;
  readonly context?: Record<string, unknown>;
  readonly timestamp: string;

  protected constructor(message: string, options?: { cause?: unknown; context?: Record<string, unknown> }) {
    super(message);
    this.name = new.target.name;
    this.cause = options?.cause;
    this.context = options?.context;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace?.(this, new.target);
  }

  get fullCode(): string {
    return `${this.namespace}_${this.code}`;
  }

  /** Safe for logging — never leaks raw payloads/PII, only structural info. */
  toLogSafeJSON(): Record<string, unknown> {
    return {
      name: this.name,
      fullCode: this.fullCode,
      message: this.message,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}
