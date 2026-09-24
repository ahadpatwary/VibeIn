import { ConnectOptions } from 'mongoose';

// export interface DatabaseConfig {
//   uri: string;
//   dbName?: string;
//   maxPoolSize?: number;
//   minPoolSize?: number;
//   serverSelectionTimeoutMS?: number;
//   socketTimeoutMS?: number;
//   connectTimeoutMS?: number;
//   heartbeatFrequencyMS?: number;
//   retryAttempts?: number;
//   retryBaseDelayMs?: number;
//   retryMaxDelayMs?: number;
//   autoIndex?: boolean;
// }

export interface DatabaseConnOpt extends ConnectOptions {
   dbName: string;
   maxPoolSize: number;
   minPoolSize: number;
   serverSelectionTimeoutMS?: number;
   socketTimeoutMS?: number;
   connectTimeoutMS?: number;
   heartbeatFrequencyMS?: number;
   retryAttempts?: number;
   retryBaseDelayMs?: number;
   retryMaxDelayMs?: number;
   autoIndex?: boolean;
}

export interface DatabaseConfig {
   uri: string;
   connOption: DatabaseConnOpt;
}

export interface PaginationOptions {
   page?: number;
   limit?: number;
   sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
   data: T[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
}
