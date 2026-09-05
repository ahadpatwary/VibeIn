import { AppError } from "./app-error.base";

const NAMESPACE = "CDC";

export abstract class ChangeStreamError extends AppError {
  readonly namespace = NAMESPACE;
}

export class ChangeStreamConnectionError extends ChangeStreamError {
  readonly code = "CONNECTION_FAILED";
  readonly retryable = true;

  constructor(cause?: unknown) {
    super("Failed to open MongoDB change stream", { cause });
  }
}

/**
 * Thrown when the persisted resume token is no longer valid — typically
 * because the oplog window rolled past it (change stream was down too long).
 * NOT retryable with the same token; caller must fall back to a full
 * resync / reconciliation sweep and start a fresh stream.
 */
export class ChangeStreamResumeTokenInvalidError extends ChangeStreamError {
  readonly code = "RESUME_TOKEN_INVALID";
  readonly retryable = false;

  constructor(cause?: unknown) {
    super(
      "Change stream resume token invalid/expired (oplog window exceeded) — falling back to reconciliation sweep",
      { cause }
    );
  }
}

export class ChangeStreamClosedUnexpectedlyError extends ChangeStreamError {
  readonly code = "CLOSED_UNEXPECTEDLY";
  readonly retryable = true;

  constructor(cause?: unknown) {
    super("Change stream cursor closed unexpectedly", { cause });
  }
}

export class ChangeStreamCheckpointWriteError extends ChangeStreamError {
  readonly code = "CHECKPOINT_WRITE_FAILED";
  readonly retryable = true;

  constructor(cause?: unknown) {
    super("Failed to persist change stream resume token checkpoint", { cause });
  }
}

export class ChangeStreamNotSupportedError extends ChangeStreamError {
  readonly code = "NOT_SUPPORTED";
  readonly retryable = false;

  constructor() {
    super(
      "Change streams require MongoDB replica set / sharded cluster (not a standalone instance). " +
        "Ensure your deployment supports oplog-based change streams."
    );
  }
}

/** Mirrors mapMongooseError() / mapRedisError() — translates driver errors during CDC watch. */
export function mapChangeStreamError(err: unknown): ChangeStreamError {
  if (err instanceof ChangeStreamError) return err;

  const mongoErr = err as { code?: number; codeName?: string; message?: string };

  // 260 = ChangeStreamHistoryLost -> resume token fell off the oplog
  if (mongoErr?.code === 260 || mongoErr?.codeName === "ChangeStreamHistoryLost") {
    return new ChangeStreamResumeTokenInvalidError(err);
  }

  // 40573 = standalone server does not support $changeStream
  if (mongoErr?.code === 40573) {
    return new ChangeStreamNotSupportedError();
  }

  if (mongoErr?.message?.toLowerCase().includes("closed")) {
    return new ChangeStreamClosedUnexpectedlyError(err);
  }

  return new ChangeStreamConnectionError(err);
}
