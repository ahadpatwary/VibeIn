import { Inject, Injectable } from "@nestjs/common";
import { type DatabaseConfig } from "./types/database.types";
import { type Logger } from "./utils/database.logger";
import { type ConnectionError } from "./exceptions/database.exceptions";
import { Pool } from "pg";




@Injectable()
export class DatabaseService {
  private isConnected = false;
  private pool: Pool | null = null;

  constructor(
    @Inject('DATABASE_CONFIG') private readonly config: DatabaseConfig,
    @Inject('DATABASE_LOGGER') private readonly logger: Logger,
    @Inject('DATABASE_EVENTS') private readonly events: Record<string, string>,
    @Inject('DATABASE_CONNECTION_EXCEPTION') private readonly ConnectionError: new (err: Error, context?: any) => any,
  ) {}

  async onModuleInit() {
    try {

      const {
        host,
        port,
        username,
        password,
        database,
        maxConnections,
        minConnections,
        connectionTimeout,
        idleTimeout,
        keepAlive,
        keepAliveInitialDelay,
      } = this.config;

      this.pool = new Pool({
        // host,
        // port,
        // user: username,
        // password,
        // database,
        connectionString: "",

        // ২. পুল সাইজ এবং টাইমাউট কনফিগারেশন
        max: maxConnections,         // পুলে সর্বোচ্চ কতটি কানেকশন থাকবে
        min: minConnections,         // পুলে সর্বনিম্ন কতটি কানেকশন সবসময় রেডি থাকবে
        idleTimeoutMillis: idleTimeout, // একটি কানেকশন কতক্ষণ অলস বসে থাকলে বন্ধ করে দেওয়া হবে (Default: 30000)
        connectionTimeoutMillis: connectionTimeout, // ডাটাবেজের সাথে কানেক্ট হতে সর্বোচ্চ কতক্ষণ चेष्टा करবে (Default: 0 - नो टाइमाउट)

        
        // ৩. প্রোডাকশন সিকিউরিটি এবং লাইভনেস
        ssl: true,                        // প্রোডাকশনে ডাটাবেজ সিকিউরিটির জন্য (যেমন: AWS RDS, Supabase, Neon)
        keepalive: keepAlive,                  // কানেকশন সচল রাখতে TCP KeepAlive এনাবল করে (Default: false)
        keepaliveInitialDelayMillis: keepAliveInitialDelay // কতক্ষণ পর পর keepalive চেক করবে
      });

      this.isConnected = true;
      const result = await this.pool.query('SELECT 1');

      this.logger.info('Database pool created successfully', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
      });

    } catch(err) {
      this.isConnected = false;
      this.logger.error('Failed to create database pool', { error: err });
      // throw new this.ConnectionError();
    }
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      this.isConnected = false;

      this.logger.info('Database pool closed gracefully');

    } catch (error) {
      //force fully shatdown database
      this.pool.end().catch(() => {});
      this.isConnected = false;
      this.logger.warn('Database pool closed forcefully', { error });
    }
  }
  
}