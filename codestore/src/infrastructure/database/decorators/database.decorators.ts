import pRetry from "p-retry";
import { DatabaseError, DatabaseErrorCode } from "../exceptions/database.exceptions";

export async function safeQuery<T>(command: string, queryFn: () => Promise<T>): Promise<T> {
  return pRetry(queryFn, {
    retries: 3,        // max 3 time try
    minTimeout: 1000,  
    factor: 2,         // exponential backoff power 2
    onFailedAttempt: (error) => {
        if(error instanceof DatabaseError) throw error; // don't retry on known database errors
        throw new DatabaseError(
          `Failed to execute query "${command}" after ${error.attemptNumber} attempts: ${error.error}`,
          DatabaseErrorCode.QUERY_FAILED,
          500,
          { command, attempt: error.attemptNumber, originalError: error },
        );
    },
  });
}