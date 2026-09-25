import { Error as MongooseError } from 'mongoose';

import {
   CastException,
   DatabaseException,
   DatabaseValidationException,
   DocumentNotFoundException,
   DuplicateKeyException,
   UnknownDatabaseException,
} from './database.exception';

interface MongoServerErrorLike {
   code?: number;
   keyValue?: Record<string, unknown>;
}

export function mapMongooseError(
   error: unknown,
   context?: Record<string, unknown>,
): DatabaseException {
   if (error instanceof DatabaseException) return error;

   if (error instanceof MongooseError.ValidationError) {
      const details = Object.fromEntries(
         Object.entries(error.errors).map(([key, e]) => [key, e.message]),
      );
      return new DatabaseValidationException('Document failed schema validation', error, {
         ...context,
         details,
      });
   }

   if (error instanceof MongooseError.CastError) {
      return new CastException(`Invalid value for field "${error.path}"`, error, {
         ...context,
         path: error.path,
         value: error.value,
      });
   }

   if (error instanceof MongooseError.DocumentNotFoundError) {
      return new DocumentNotFoundException('Document not found', error, context);
   }

   const mongoErr = error as MongoServerErrorLike | undefined;
   if (
      mongoErr &&
      typeof mongoErr === 'object' &&
      (mongoErr.code === 11000 || mongoErr.code === 11001)
   ) {
      return new DuplicateKeyException('Duplicate key violation', mongoErr, {
         ...context,
         keyValue: mongoErr.keyValue,
      });
   }

   return new UnknownDatabaseException(
      error instanceof Error ? error.message : 'Unknown database error',
      error,
      context,
   );
}
