import { z } from 'zod';
import { DB_CONSTANTS } from '../constants/db.constants';
import type { DatabaseConnOpt } from '../types/db.types';

export const databaseConfigSchema = z.object({
  uri: z.string().min(1, 'MongoDB URI is required'),
  dbName: z.string().optional(),
  maxPoolSize: z.number().int().positive().default(DB_CONSTANTS.DEFAULT_MAX_POOL_SIZE),
  minPoolSize: z.number().int().nonnegative().default(DB_CONSTANTS.DEFAULT_MIN_POOL_SIZE),
  serverSelectionTimeoutMS: z
    .number()
    .int()
    .positive()
    .default(DB_CONSTANTS.DEFAULT_SERVER_SELECTION_TIMEOUT_MS),
  socketTimeoutMS: z.number().int().positive().default(DB_CONSTANTS.DEFAULT_SOCKET_TIMEOUT_MS),
  connectTimeoutMS: z.number().int().positive().default(DB_CONSTANTS.DEFAULT_CONNECT_TIMEOUT_MS),
  heartbeatFrequencyMS: z
    .number()
    .int()
    .positive()
    .default(DB_CONSTANTS.DEFAULT_HEARTBEAT_FREQUENCY_MS),
  retryAttempts: z.number().int().nonnegative().default(DB_CONSTANTS.DEFAULT_RETRY_ATTEMPTS),
  retryBaseDelayMs: z.number().int().positive().default(DB_CONSTANTS.DEFAULT_RETRY_BASE_DELAY_MS),
  retryMaxDelayMs: z.number().int().positive().default(DB_CONSTANTS.DEFAULT_RETRY_MAX_DELAY_MS),
  autoIndex: z.boolean().default(false),
}).passthrough();


export function parseDatabaseConfig(raw: unknown): unknown {
  const data = databaseConfigSchema.safeParse(raw);

  if(data.success) {
    return data.data;
  }
}
