import type { DependencyContainer } from 'tsyringe';
import { container } from 'tsyringe';

import { MongooseClient } from '../client/mongoose.client';
import { parseDatabaseConfig } from '../config/database.config';
import { DB_TOKENS } from '../tokens/db.tokens';
import type { DatabaseConfig, DatabaseConnOpt } from '../types/db.types';

export function registerDatabaseModule(
   targetContainer: DependencyContainer = container,
   config: DatabaseConfig,
): DependencyContainer {
   const parsedConfig = parseDatabaseConfig(config);

   targetContainer.register<DatabaseConnOpt>(DB_TOKENS.DatabaseConnOpt, {
      useValue: parsedConfig.connOption,
   });

   targetContainer.registerSingleton(MongooseClient);

   return targetContainer;
}

export { container as rootContainer };
