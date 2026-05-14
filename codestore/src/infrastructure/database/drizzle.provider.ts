// drizzle.provider.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DatabaseOptions } from './types';

export function createDrizzleClient(options: DatabaseOptions) {
  const pool = new Pool({
    connectionString: options.connectionString,
  });

  const db = drizzle(pool);

  return {
    db,
    pool,
  };
}