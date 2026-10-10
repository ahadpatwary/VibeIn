import type { AuthProvider, IAuthIdentity } from '@app/db-schemas';
import { AuthIdentitySchema, AuthProvider as Provider } from '@app/db-schemas';
import type { ClientSession, Model, Types } from 'mongoose';
import { CreateAuthIdentity } from '@app/contracts';
import { Inject, Injectable } from '@nestjs/common';
import { IdentityRecord } from '../types/type';
import { DB_TOKENS, MongooseClient } from '@app/mongo';

@Injectable()
export class AuthIdentityRepository {
   private readonly authModel: Model<IAuthIdentity>;
   constructor(
      @Inject(DB_TOKENS.MongooseClient)
      private readonly mongooseClient: MongooseClient,
   ) {
      this.authModel = this.mongooseClient
         .getConnection()
         .model<IAuthIdentity>('AuthIdentity', AuthIdentitySchema);
   }

   findByProvider(
      provider: AuthProvider,
      providerId: string,
      session?: ClientSession,
   ): Promise<IdentityRecord | null> {
      return this.authModel
         .findOne({ provider, providerId })
         .session(session ?? null)
         .lean<IdentityRecord>()
         .exec();
   }

   async findByUserAndProvider(
      userId: Types.ObjectId,
      provider: AuthProvider,
      session?: ClientSession,
   ): Promise<CreateAuthIdentity | null> {
      return await this.authModel
         .findOne({ userId, provider })
         .session(session ?? null)
         .lean<CreateAuthIdentity>()
         .exec();
   }

   async create(data: CreateAuthIdentity, session?: ClientSession): Promise<void> {
      await this.authModel.create([data], { session });
   }

   /**
    * Reset flow:
    * credentials identity থাকলে update,
    * না থাকলে provider-only user-এর জন্য create.
    */
   async setCredentialsPassword(
      userId: Types.ObjectId,
      email: string,
      passwordHash: string,
      session?: ClientSession,
   ): Promise<void> {
      await this.authModel.updateOne(
         {
            userId,
            provider: Provider.Credentials,
         },
         {
            $set: {
               passwordHash,
               providerEmail: email,
            },
            $setOnInsert: {
               providerId: userId.toString(),
            },
         },
         {
            upsert: true,
            session,
         },
      );
   }

   async touchLastLogin(
      userId: Types.ObjectId,
      provider: AuthProvider,
      session?: ClientSession,
   ): Promise<void> {
      await this.authModel.updateOne(
         {
            userId,
            provider,
         },
         {
            $set: {
               lastLoginAt: new Date(),
            },
         },
         {
            session,
         },
      );
   }
}
