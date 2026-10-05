import { mongo } from 'mongoose';
import { inject, injectable } from 'tsyringe';

import { MongooseClient } from '../client/mongoose.client';
import { DEFAULT_TRANSACTION_OPTIONS } from '../constants/db.constants';
import { TransactionException } from '../exception/database.exception';
import { DB_TOKENS } from '../tokens/db.tokens';
import { TransactionCallback } from '../types/db.types';

@injectable()
export class MongoService {
   constructor(
      @inject(DB_TOKENS.MongooseClient)
      private readonly client: MongooseClient,
   ) {}

   async withTransaction<T>(
      fn: TransactionCallback<T>,
      options: mongo.TransactionOptions = {},
   ): Promise<T> {
      const conn = this.client.getConnection();

      try {
         return await conn.transaction(fn, {
            ...DEFAULT_TRANSACTION_OPTIONS,
            ...options,
         });
      } catch (error) {
         if (error instanceof TransactionException) throw error;

         throw new TransactionException('Transaction failed and was rolled back', error);
      }
   }
}
