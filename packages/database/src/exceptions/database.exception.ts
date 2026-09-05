import { DATABASE_ERRORS, TDatabaseErrorCode } from '../constants/database.constant';

export class DatabaseException extends Error {
  public readonly code: TDatabaseErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: TDatabaseErrorCode,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DatabaseException';
    this.code = code;
    this.originalError = originalError;
    this.context = context;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      originalError: this.originalError?.message,
      stack: this.stack,
    };
  }
}

// ---------- connection lifecycle ----------

export class DatabaseConnectionException extends DatabaseException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Database connection failed: ${originalError?.message ?? 'Unknown error'}`,
      DATABASE_ERRORS.CONNECTION_FAILED,
      originalError,
      context,
    );
    this.name = 'DatabaseConnectionException';
  }
}

export class DatabaseNotInitializedException extends DatabaseException {
  constructor() {
    super(
      'Database connection is not initialized. Call connect() first.',
      DATABASE_ERRORS.NOT_INITIALIZED,
    );
    this.name = 'DatabaseNotInitializedException';
  }
}

export class DatabaseServerSelectionException extends DatabaseException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `No MongoDB server available: ${originalError?.message ?? 'Server selection timed out'}`,
      DATABASE_ERRORS.SERVER_SELECTION_TIMEOUT,
      originalError,
      context,
    );
    this.name = 'DatabaseServerSelectionException';
  }
}

// ---------- schema / document level ----------

export class DatabaseValidationException extends DatabaseException {
  public readonly fields: string[];

  constructor(fields: string[], originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Validation failed: ${fields.join(', ')}`,
      DATABASE_ERRORS.VALIDATION_FAILED,
      originalError,
      { fields, ...context },
    );
    this.name = 'DatabaseValidationException';
    this.fields = fields;
  }
}

export class DatabaseCastException extends DatabaseException {
  public readonly path: string;
  public readonly value: unknown;

  constructor(path: string, value: unknown, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Invalid value for field '${path}': ${String(value)}`,
      DATABASE_ERRORS.CAST_ERROR,
      originalError,
      { path, value, ...context },
    );
    this.name = 'DatabaseCastException';
    this.path = path;
    this.value = value;
  }
}

export class DatabaseStrictModeException extends DatabaseException {
  constructor(path: string, context?: Record<string, unknown>) {
    super(
      `Field '${path}' is not defined in the schema (strict mode)`,
      DATABASE_ERRORS.STRICT_MODE_VIOLATION,
      undefined,
      { path, ...context },
    );
    this.name = 'DatabaseStrictModeException';
  }
}

export class DatabaseParallelSaveException extends DatabaseException {
  constructor(documentId: string, context?: Record<string, unknown>) {
    super(
      `Document '${documentId}' is already being saved concurrently`,
      DATABASE_ERRORS.PARALLEL_SAVE,
      undefined,
      { documentId, ...context },
    );
    this.name = 'DatabaseParallelSaveException';
  }
}

export class DatabaseVersionConflictException extends DatabaseException {
  constructor(modelName: string, documentId: string, context?: Record<string, unknown>) {
    super(
      `Optimistic concurrency conflict on '${modelName}' (id: ${documentId}) — document was modified elsewhere`,
      DATABASE_ERRORS.VERSION_CONFLICT,
      undefined,
      { modelName, documentId, ...context },
    );
    this.name = 'DatabaseVersionConflictException';
  }
}

export class DatabaseDocumentNotFoundException extends DatabaseException {
  constructor(modelName: string, identifier: Record<string, unknown> | string, context?: Record<string, unknown>) {
    super(
      `${modelName} not found for: ${typeof identifier === 'string' ? identifier : JSON.stringify(identifier)}`,
      DATABASE_ERRORS.DOCUMENT_NOT_FOUND,
      undefined,
      { modelName, identifier, ...context },
    );
    this.name = 'DatabaseDocumentNotFoundException';
  }
}

// ---------- write operations ----------

export class DatabaseDuplicateKeyException extends DatabaseException {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(field?: string, value?: unknown, originalError?: Error, context?: Record<string, unknown>) {
    super(
      field ? `Duplicate value for field '${field}'` : 'Duplicate key error',
      DATABASE_ERRORS.DUPLICATE_KEY,
      originalError,
      { field, value, ...context },
    );
    this.name = 'DatabaseDuplicateKeyException';
    this.field = field;
    this.value = value;
  }
}

export class DatabaseWriteConflictException extends DatabaseException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Write conflict — concurrent operation modified the same document(s)`,
      DATABASE_ERRORS.WRITE_CONFLICT,
      originalError,
      context,
    );
    this.name = 'DatabaseWriteConflictException';
  }
}

export class DatabaseBulkWriteException extends DatabaseException {
  public readonly failedCount: number;
  public readonly insertedCount: number;

  constructor(
    failedCount: number,
    insertedCount: number,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `Bulk write failed: ${failedCount} operation(s) failed, ${insertedCount} succeeded`,
      DATABASE_ERRORS.BULK_WRITE_FAILED,
      originalError,
      { failedCount, insertedCount, ...context },
    );
    this.name = 'DatabaseBulkWriteException';
    this.failedCount = failedCount;
    this.insertedCount = insertedCount;
  }
}

export class DatabaseWriteConcernException extends DatabaseException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Write concern could not be satisfied: ${originalError?.message ?? 'Unknown error'}`,
      DATABASE_ERRORS.WRITE_CONCERN_FAILED,
      originalError,
      context,
    );
    this.name = 'DatabaseWriteConcernException';
  }
}

// ---------- transactions ----------

export class DatabaseTransactionException extends DatabaseException {
  constructor(operation: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Transaction failed during '${operation}': ${originalError?.message ?? 'Unknown error'}`,
      DATABASE_ERRORS.TRANSACTION_FAILED,
      originalError,
      { operation, ...context },
    );
    this.name = 'DatabaseTransactionException';
  }
}

export class DatabaseTransactionAbortedException extends DatabaseException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Transaction was aborted: ${originalError?.message ?? 'Unknown reason'}`,
      DATABASE_ERRORS.TRANSACTION_ABORTED,
      originalError,
      context,
    );
    this.name = 'DatabaseTransactionAbortedException';
  }
}

// ---------- query / command level ----------

export class DatabaseQueryException extends DatabaseException {
  public readonly operation: string;

  constructor(operation: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `Database operation '${operation}' failed: ${originalError?.message ?? 'Unknown error'}`,
      DATABASE_ERRORS.QUERY_FAILED,
      originalError,
      { operation, ...context },
    );
    this.name = 'DatabaseQueryException';
    this.operation = operation;
  }
}

export class DatabaseTimeoutException extends DatabaseException {
  constructor(operation: string, timeoutMs: number, context?: Record<string, unknown>) {
    super(
      `Database operation '${operation}' timed out after ${timeoutMs}ms`,
      DATABASE_ERRORS.COMMAND_TIMEOUT,
      undefined,
      { operation, timeoutMs, ...context },
    );
    this.name = 'DatabaseTimeoutException';
  }
}

// ---------- misc ----------

export class DatabaseSerializationException extends DatabaseException {
  constructor(
    action: 'serialize' | 'deserialize',
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `Database ${action} failed: ${originalError?.message ?? 'Unknown error'}`,
      DATABASE_ERRORS.SERIALIZATION_ERROR,
      originalError,
      context,
    );
    this.name = 'DatabaseSerializationException';
  }
}