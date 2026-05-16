export enum DatabaseErrorCode {
  CONNECTION_FAILED    = 'DB_CONNECTION_FAILED',
  QUERY_FAILED         = 'DB_QUERY_FAILED',
  NOT_FOUND            = 'DB_NOT_FOUND',
  DUPLICATE_ENTRY      = 'DB_DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION = 'DB_FOREIGN_KEY_VIOLATION',
  VALIDATION_FAILED    = 'DB_VALIDATION_FAILED',
  TRANSACTION_FAILED   = 'DB_TRANSACTION_FAILED',
  UNAUTHORIZED         = 'DB_UNAUTHORIZED',
}

export class DatabaseError extends Error {
  public readonly code: DatabaseErrorCode;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly meta?: Record<string, unknown>;

  constructor(
    message: string,
    code: DatabaseErrorCode,
    statusCode = 500,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name        = 'DatabaseError';
    this.code        = code;
    this.statusCode  = statusCode;
    this.timestamp   = new Date();
    this.meta        = meta;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name:       this.name,
      message:    this.message,
      code:       this.code,
      statusCode: this.statusCode,
      timestamp:  this.timestamp,
      meta:       this.meta,
      stack:      process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}



// ─── Not Found ────────────────────────────────────────────────────────────────
export class NotFoundError extends DatabaseError {
  constructor(entity: string, identifier: string | number) {
    super(
      `${entity} with identifier "${identifier}" was not found.`,
      DatabaseErrorCode.NOT_FOUND,
      404,
      { entity, identifier },
    );
    this.name = 'NotFoundError';
  }
}

// ─── Duplicate Entry ─────────────────────────────────────────────────────────
export class DuplicateEntryError extends DatabaseError {
  constructor(entity: string, field: string, value: unknown) {
    super(
      `${entity} with ${field} "${value}" already exists.`,
      DatabaseErrorCode.DUPLICATE_ENTRY,
      409,
      { entity, field, value },
    );
    this.name = 'DuplicateEntryError';
  }
}

// ─── Foreign Key Violation ────────────────────────────────────────────────────
export class ForeignKeyViolationError extends DatabaseError {
  constructor(entity: string, relatedEntity: string) {
    super(
      `Cannot perform this operation on "${entity}" because it references "${relatedEntity}".`,
      DatabaseErrorCode.FOREIGN_KEY_VIOLATION,
      422,
      { entity, relatedEntity },
    );
    this.name = 'ForeignKeyViolationError';
  }
}

// ─── Validation Error ─────────────────────────────────────────────────────────
export class ValidationError extends DatabaseError {
  constructor(entity: string, fields: Record<string, string>) {
    super(
      `Validation failed for "${entity}".`,
      DatabaseErrorCode.VALIDATION_FAILED,
      400,
      { entity, fields },
    );
    this.name = 'ValidationError';
  }
}

// ─── Transaction Error ────────────────────────────────────────────────────────
export class TransactionError extends DatabaseError {
  constructor(reason: string) {
    super(
      `Transaction failed: ${reason}`,
      DatabaseErrorCode.TRANSACTION_FAILED,
      500,
      { reason },
    );
    this.name = 'TransactionError';
  }
}

// ─── Connection Error ─────────────────────────────────────────────────────────
export class ConnectionError extends DatabaseError {
  constructor(host: string, reason: string) {
    super(
      `Database connection to "${host}" failed: ${reason}`,
      DatabaseErrorCode.CONNECTION_FAILED,
      503,
      { host, reason },
    );
    this.name = 'ConnectionError';
  }
}

// ─── Query Error ──────────────────────────────────────────────────────────────
export class QueryError extends DatabaseError {
  constructor(query: string, reason: string) {
    super(
      `Query execution failed: ${reason}`,
      DatabaseErrorCode.QUERY_FAILED,
      500,
      { query: process.env.NODE_ENV === 'development' ? query : '[redacted]', reason },
    );
    this.name = 'QueryError';
  }
}