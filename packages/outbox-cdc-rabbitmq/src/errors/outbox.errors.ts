import { AppError } from "./app-error.base";

const NAMESPACE = "OUTBOX";

export abstract class OutboxError extends AppError {
  readonly namespace = NAMESPACE;
}

export class OutboxWriteFailedError extends OutboxError {
  readonly code = "WRITE_FAILED";
  readonly retryable = true;

  constructor(context: { aggregateType: string; aggregateId: string; eventType: string }, cause?: unknown) {
    super(`Failed to persist outbox event for aggregate "${context.aggregateType}:${context.aggregateId}"`, {
      cause,
      context,
    });
  }
}

export class OutboxTransactionAbortedError extends OutboxError {
  readonly code = "TRANSACTION_ABORTED";
  readonly retryable = true;

  constructor(reason: string, cause?: unknown) {
    super(`Outbox transaction aborted: ${reason}`, { cause });
  }
}

export class OutboxEventNotFoundError extends OutboxError {
  readonly code = "EVENT_NOT_FOUND";
  readonly retryable = false;

  constructor(eventId: string) {
    super(`Outbox event "${eventId}" not found`, { context: { eventId } });
  }
}

export class OutboxEventAlreadyPublishedError extends OutboxError {
  readonly code = "ALREADY_PUBLISHED";
  readonly retryable = false;

  constructor(eventId: string) {
    super(`Outbox event "${eventId}" was already marked published (idempotent no-op)`, { context: { eventId } });
  }
}

export class OutboxMaxRetriesExceededError extends OutboxError {
  readonly code = "MAX_RETRIES_EXCEEDED";
  readonly retryable = false;

  constructor(eventId: string, attempts: number, cause?: unknown) {
    super(`Outbox event "${eventId}" exceeded max publish retries (${attempts})`, {
      cause,
      context: { eventId, attempts },
    });
  }
}

export class OutboxSchemaValidationError extends OutboxError {
  readonly code = "SCHEMA_VALIDATION";
  readonly retryable = false;

  constructor(cause: unknown, context?: Record<string, unknown>) {
    super("Outbox event failed schema validation", { cause, context });
  }
}

/**
 * Translator: maps raw Mongoose/MongoDB driver errors (and unknowns)
 * that occur specifically during outbox writes into the typed hierarchy.
 * Mirrors mapMongooseError() / mapKafkaError() from existing modules.
 */
export function mapOutboxError(
  err: unknown,
  context: { aggregateType: string; aggregateId: string; eventType: string }
): OutboxError {
  if (err instanceof OutboxError) return err;

  const mongoErr = err as { code?: number; codeName?: string; message?: string };

  // Transient / retryable Mongo conditions
  if (
    mongoErr?.codeName === "WriteConflict" ||
    mongoErr?.codeName === "LockTimeout" ||
    mongoErr?.code === 112 /* WriteConflict */ ||
    mongoErr?.code === 251 /* NoSuchTransaction */
  ) {
    return new OutboxTransactionAbortedError(mongoErr.codeName ?? "transient conflict", err);
  }

  return new OutboxWriteFailedError(context, err);
}
