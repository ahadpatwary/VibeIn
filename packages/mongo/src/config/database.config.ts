import { z } from 'zod';
import { DB_CONSTANTS } from '../constants/db.constants';
import type { DatabaseConfig, DatabaseConnOpt } from '../types/db.types';

export const connectionOptionSchema = z
   .object({
      dbName: z.string().trim().min(1, 'DB name is requred'),
      maxPoolSize: z.number().positive('max pool size must be requred'),
      minPoolSize: z.number().positive('min pool size must be required'),
   })
   .passthrough();

export const databaseConfigSchema = z.object({
   uri: z.string().min(1, 'MongoDB URI is required'),
   connOption: connectionOptionSchema,
});

let cachedConfig: DatabaseConfig | null = null;

export function parseDatabaseConfig(raw: DatabaseConfig): DatabaseConfig {
   const parsed = databaseConfigSchema.safeParse(raw);

   if (!parsed.success) {
      throw new Error(`Invalid Database configuration: ${parsed.error.toString()}`);
   }

   const data = {
      maxPoolSize: DB_CONSTANTS.DEFAULT_MAX_POOL_SIZE,
      minPoolSize: DB_CONSTANTS.DEFAULT_MIN_POOL_SIZE,
      serverSelectionTimeoutMS: DB_CONSTANTS.DEFAULT_SERVER_SELECTION_TIMEOUT_MS,
      socketTimeoutMS: DB_CONSTANTS.DEFAULT_SOCKET_TIMEOUT_MS,
      connectTimeoutMS: DB_CONSTANTS.DEFAULT_CONNECT_TIMEOUT_MS,
      heartbeatFrequencyMS: DB_CONSTANTS.DEFAULT_HEARTBEAT_FREQUENCY_MS,
      autoIndex: false,
   };

   cachedConfig = {
      ...data,
      ...parsed.data,
   };

   return cachedConfig;
}
