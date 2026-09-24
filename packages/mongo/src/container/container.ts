import { container, DependencyContainer } from 'tsyringe';
import { DB_TOKENS } from '../tokens/db.tokens';
import { MongooseClient } from '../client/mongoose.client';
import { parseDatabaseConfig } from '../config/database.config';
import type { DatabaseConfig, DatabaseConnOpt } from '../types/db.types';

/**
 * Registers the database module (config, logger, MongooseClient) into a
 * tsyringe container. Call this once at application bootstrap, before
 * resolving any repository.
 *
 *   const dbContainer = registerDatabaseModule({ config: { uri: process.env.MONGO_URI } });
 *   const client = dbContainer.resolve(MongooseClient);
 *   await client.connect();
 */
export function registerDatabaseModule(
   targetContainer: DependencyContainer = container,
   config: DatabaseConfig,
): DependencyContainer {
   const parsedConfig = parseDatabaseConfig(config);

   console.log('parsedConfig', parsedConfig);

   console.log('REGISTER TOKEN:', DB_TOKENS.DatabaseConnOpt);

   targetContainer.register<DatabaseConnOpt>(DB_TOKENS.DatabaseConnOpt, {
      useValue: parsedConfig.connOption,
   });

   console.log('REGISTERED:', targetContainer.isRegistered(DB_TOKENS.DatabaseConnOpt));

   targetContainer.registerSingleton(MongooseClient);

   return targetContainer;
}

export { container as rootContainer };
