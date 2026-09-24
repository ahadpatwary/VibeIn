import 'reflect-metadata';
import { inject, injectable, singleton } from 'tsyringe';
import mongoose, { Connection, ClientSession } from 'mongoose';
import { DB_TOKENS } from '../tokens/db.tokens';
import type { DatabaseConnOpt } from '../types/db.types';
import {
   DatabaseConnectionException,
   DatabaseConnectionTimeoutException,
   TransactionException,
} from '../exception/database.exception';
import { withRetry } from '../util/retry.util';
import { MONGOOSE_CONNECTION_EVENTS } from '../constants/db.constants';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';

@singleton()
@injectable()
export class MongooseClient {
   private connection: Connection | null = null;
   private connecting: Promise<Connection> | null = null;
   private readonly logger: ILogger;

   constructor(
      @inject(DB_TOKENS.DatabaseConnOpt) private readonly databaseConnOpt: DatabaseConnOpt,
      @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
   ) {
      this.logger = factory.forModule('DATABASE_MODULE');
   }

   async connect(uri: string): Promise<Connection> {
      if (this.connection && this.connection.readyState === 1) return this.connection;
      if (this.connecting) return this.connecting;

      this.connecting = this.establishConnection(uri);
      try {
         this.connection = await this.connecting;
         return this.connection;
      } finally {
         this.connecting = null;
      }
   }

   private async establishConnection(uri: string): Promise<Connection> {
      try {
         return await withRetry(
            async () => {
               const conn = mongoose.createConnection(uri, this.databaseConnOpt);

               await conn.asPromise();
               this.registerEventListeners(conn);
               this.logger.info('MongoDB connection established', {
                  dbName: this.databaseConnOpt.dbName,
               });
               return conn;
            },
            {
               attempts: this.databaseConnOpt.retryAttempts ?? 5,
               baseDelayMs: this.databaseConnOpt.retryBaseDelayMs ?? 200,
               maxDelayMs: this.databaseConnOpt.retryMaxDelayMs ?? 5000,
               onRetry: (attempt, error, delayMs) => {
                  this.logger.warn(
                     `MongoDB connection attempt ${attempt} failed, retrying in ${delayMs}ms`,
                     {
                        error: error instanceof Error ? error.message : error,
                     },
                  );
               },
            },
         );
      } catch (error) {
         if (error instanceof Error && /timed?\s?out/i.test(error.message)) {
            throw new DatabaseConnectionTimeoutException('MongoDB connection timed out', error);
         }
         throw new DatabaseConnectionException('Failed to establish MongoDB connection', error);
      }
   }

   private registerEventListeners(conn: Connection) {
      conn.on(MONGOOSE_CONNECTION_EVENTS.DISCONNECTED, () =>
         this.logger.warn('MongoDB disconnected'),
      );
      conn.on(MONGOOSE_CONNECTION_EVENTS.RECONNECTED, () =>
         this.logger.info('MongoDB reconnected'),
      );
      conn.on(MONGOOSE_CONNECTION_EVENTS.ERROR, (err: Error) =>
         this.logger.error('MongoDB connection error', { error: err?.message }),
      );
   }

   getConnection(): Connection {
      if (!this.connection) {
         throw new DatabaseConnectionException(
            'MongoDB connection has not been established. Call connect() first.',
         );
      }
      return this.connection;
   }

   async disconnect(): Promise<void> {
      if (this.connection) {
         await this.connection.close();
         this.connection = null;
         this.logger.info('MongoDB connection closed');
      }
   }

   async withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
      const conn = this.getConnection();
      const session = await conn.startSession();
      try {
         let result: T | undefined;
         await session.withTransaction(async () => {
            result = await fn(session);
         });
         return result as T;
      } catch (error) {
         throw new TransactionException('Transaction failed and was rolled back', error);
      } finally {
         await session.endSession();
      }
   }
}
