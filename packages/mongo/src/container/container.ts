import 'reflect-metadata';
import { container, DependencyContainer } from 'tsyringe';
import { DB_TOKENS } from '../tokens/db.tokens';
import { MongooseClient } from '../client/mongoose.client';
import { parseDatabaseConfig } from '../config/database.config';
import type { DatabaseConnOpt } from '../types/db.types';
import { ILogger } from '@app/logger';

export interface RegisterDatabaseModuleOptions {
  /** Raw config object; validated internally against databaseConfigSchema (Zod). */
  config: unknown;
  /** Optional custom logger. Defaults to ConsoleLogger. */
  logger?: ILogger;
  /** Optional tsyringe child container. Defaults to the root container. */
  childContainer?: DependencyContainer;
}

/**
 * Registers the database module (config, logger, MongooseClient) into a
 * tsyringe container. Call this once at application bootstrap, before
 * resolving any repository.
 *
 *   const dbContainer = registerDatabaseModule({ config: { uri: process.env.MONGO_URI } });
 *   const client = dbContainer.resolve(MongooseClient);
 *   await client.connect();
 */
export function registerDatabaseModule(options: RegisterDatabaseModuleOptions): DependencyContainer {
  const target = options.childContainer ?? container;
  const parsedConfig: DatabaseConfig = parseDatabaseConfig(options.config);

  target.register<DatabaseConnOpt>(DB_TOKENS.DatabaseConnOpt, { useValue: parsedConfig });
  target.register<Logger>(DB_TOKENS.Logger, { useValue: options.logger ?? new ConsoleLogger() });
  target.registerSingleton(MongooseClient);

  return target;
}

export { container as rootContainer };
