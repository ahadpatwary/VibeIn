// drizzle.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DB_CLIENT } from './database/constants';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DB_CLIENT)
    private readonly client: {
      db: any;
      pool: Pool;
    },
  ) {}

  get db() {
    return this.client.db;
  }

  get pool() {
    return this.client.pool;
  }
}