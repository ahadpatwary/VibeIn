export enum DatabaseErrorCode {
  CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  CONNECTION_TIMEOUT = 'DB_CONNECTION_TIMEOUT',
  VALIDATION_FAILED = 'DB_VALIDATION_FAILED',
  DUPLICATE_KEY = 'DB_DUPLICATE_KEY',
  DOCUMENT_NOT_FOUND = 'DB_DOCUMENT_NOT_FOUND',
  CAST_ERROR = 'DB_CAST_ERROR',
  TRANSACTION_FAILED = 'DB_TRANSACTION_FAILED',
  QUERY_FAILED = 'DB_QUERY_FAILED',
  UNKNOWN = 'DB_UNKNOWN_ERROR',
}

export abstract class DatabaseException extends Error {
  abstract readonly code: DatabaseErrorCode;
  abstract readonly httpStatus: number;
  readonly isOperational = true;
  readonly cause?: unknown;
  readonly meta?: Record<string, unknown> | undefined;

  constructor(message: string, cause?: unknown, meta?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.meta = meta;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      httpStatus: this.httpStatus,
      meta: this.meta,
    };
  }
}

export class DatabaseConnectionException extends DatabaseException {
  readonly code = DatabaseErrorCode.CONNECTION_FAILED;
  readonly httpStatus = 503;
}

export class DatabaseConnectionTimeoutException extends DatabaseException {
  readonly code = DatabaseErrorCode.CONNECTION_TIMEOUT;
  readonly httpStatus = 503;
}

export class DatabaseValidationException extends DatabaseException {
  readonly code = DatabaseErrorCode.VALIDATION_FAILED;
  readonly httpStatus = 422;
}

export class DuplicateKeyException extends DatabaseException {
  readonly code = DatabaseErrorCode.DUPLICATE_KEY;
  readonly httpStatus = 409;
}

export class DocumentNotFoundException extends DatabaseException {
  readonly code = DatabaseErrorCode.DOCUMENT_NOT_FOUND;
  readonly httpStatus = 404;
}

export class CastException extends DatabaseException {
  readonly code = DatabaseErrorCode.CAST_ERROR;
  readonly httpStatus = 400;
}

export class TransactionException extends DatabaseException {
  readonly code = DatabaseErrorCode.TRANSACTION_FAILED;
  readonly httpStatus = 500;
}

export class QueryException extends DatabaseException {
  readonly code = DatabaseErrorCode.QUERY_FAILED;
  readonly httpStatus = 500;
}

export class UnknownDatabaseException extends DatabaseException {
  readonly code = DatabaseErrorCode.UNKNOWN;
  readonly httpStatus = 500;
}
