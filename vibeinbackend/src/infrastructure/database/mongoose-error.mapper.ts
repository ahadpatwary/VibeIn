import mongoose from 'mongoose';
import {
  MongoServerError,
  MongoNetworkError,
  MongoServerSelectionError,
  MongoNetworkTimeoutError,
} from 'mongodb';
import { MONGO_SERVER_ERROR_CODES } from './constants/database.constant';
import {
  DatabaseBulkWriteException,
  DatabaseCastException,
  DatabaseConnectionException,
  DatabaseDuplicateKeyException,
  DatabaseException,
  DatabaseParallelSaveException,
  DatabaseQueryException,
  DatabaseServerSelectionException,
  DatabaseStrictModeException,
  DatabaseTimeoutException,
  DatabaseTransactionAbortedException,
  DatabaseValidationException,
  DatabaseVersionConflictException,
  DatabaseWriteConflictException,
} from './exceptions/database.exception';

/**
 * Single point of translation: every repository / service method should
 * funnel its catch block through this, so callers only ever see
 * `DatabaseException` subclasses — never a raw Mongoose/MongoDB error.
 *
 * @param operation - short label for what was being attempted, e.g. "User.create"
 */
export function mapMongooseError(error: unknown, operation = 'unknown'): never {
  // Already translated (e.g. re-thrown from a nested call) -> pass through
  if (error instanceof DatabaseException) {
    throw error;
  }

  // ---- schema / document level ----

  if (error instanceof mongoose.Error.ValidationError) {
    const fields = Object.values(error.errors).map((e) => e.message);
    throw new DatabaseValidationException(fields, error, { operation });
  }

  if (error instanceof mongoose.Error.CastError) {
    throw new DatabaseCastException(error.path, error.value, error, { operation });
  }

  if (error instanceof mongoose.Error.StrictModeError) {
    throw new DatabaseStrictModeException(error.path, { operation });
  }

  if (error instanceof mongoose.Error.ParallelSaveError) {
    // mongoose sets `_id` on this error at runtime but the .d.ts doesn't declare it
    const withId = error as unknown as { _id?: unknown };
    throw new DatabaseParallelSaveException(String(withId._id ?? 'unknown'), { operation });
  }

  if (error instanceof mongoose.Error.VersionError) {
    // same typings gap as above — `_id` and the doc's model name exist at runtime
    const withDocInfo = error as unknown as { _id?: unknown; modelName?: string };
    throw new DatabaseVersionConflictException(
      withDocInfo.modelName ?? 'Unknown',
      String(withDocInfo._id ?? 'unknown'),
      { operation },
    );
  }

  // ---- write operations (raw MongoDB server errors) ----

  if (error instanceof MongoServerError) {
    if (
      error.code === MONGO_SERVER_ERROR_CODES.DUPLICATE_KEY ||
      error.code === MONGO_SERVER_ERROR_CODES.DUPLICATE_KEY_LEGACY
    ) {
      const field = Object.keys(error.keyPattern ?? {})[0];
      throw new DatabaseDuplicateKeyException(field, error.keyValue, error, { operation });
    }

    if (error.code === MONGO_SERVER_ERROR_CODES.WRITE_CONFLICT) {
      throw new DatabaseWriteConflictException(error, { operation });
    }

    if (
      error.code === MONGO_SERVER_ERROR_CODES.NO_SUCH_TRANSACTION ||
      error.code === MONGO_SERVER_ERROR_CODES.TRANSACTION_ABORTED ||
      error.hasErrorLabel?.('TransientTransactionError')
    ) {
      throw new DatabaseTransactionAbortedException(error, { operation });
    }

    if (error.code === MONGO_SERVER_ERROR_CODES.EXCEEDED_TIME_LIMIT) {
      throw new DatabaseTimeoutException(operation, 0, { originalMessage: error.message });
    }

    throw new DatabaseQueryException(operation, error);
  }

  if (isBulkWriteError(error)) {
    const failedCount = error.writeErrors?.length ?? 0;
    const insertedCount = error.result?.insertedCount ?? 0;
    throw new DatabaseBulkWriteException(failedCount, insertedCount, error, { operation });
  }

  // ---- connection / network level ----

  if (error instanceof MongoServerSelectionError) {
    throw new DatabaseServerSelectionException(error, { operation });
  }

  if (error instanceof MongoNetworkTimeoutError) {
    throw new DatabaseTimeoutException(operation, 0, { originalMessage: error.message });
  }

  if (error instanceof MongoNetworkError) {
    throw new DatabaseConnectionException(error, { operation });
  }

  // ---- fallback ----

  const err = error instanceof Error ? error : new Error('Unknown database error');
  throw new DatabaseQueryException(operation, err);
}

function isBulkWriteError(
  error: unknown,
): error is Error & { writeErrors?: unknown[]; result?: { insertedCount?: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'writeErrors' in error &&
    (error as { name?: string }).name === 'MongoBulkWriteError'
  );
}