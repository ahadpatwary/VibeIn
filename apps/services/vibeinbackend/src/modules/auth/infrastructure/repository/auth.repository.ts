import type { AuthProvider, IAuthIdentity } from '@app/db-schemas';
import { AuthProvider as Provider } from '@app/db-schemas';
import type { ClientSession, Model, Types } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import type { CreateAuthType, IdentityRecord } from '../../application/types/type';
import { AUTH_TOKENS } from '../../application/tokens/token';

@injectable()
export class AuthIdentityRepository {
   constructor(
      @inject(AUTH_TOKENS.IdentityModel)
      private readonly model: Model<IAuthIdentity>,
   ) {}

   findByProvider(
      provider: AuthProvider,
      providerId: string,
      session?: ClientSession,
   ): Promise<IdentityRecord | null> {
      return this.model
         .findOne({ provider, providerId })
         .session(session ?? null)
         .lean<IdentityRecord>()
         .exec();
   }

   findByUserAndProvider(
      userId: Types.ObjectId,
      provider: AuthProvider,
      session?: ClientSession,
   ): Promise<IdentityRecord | null> {
      return this.model
         .findOne({ userId, provider })
         .session(session ?? null)
         .lean<IdentityRecord>()
         .exec();
   }

   async create(data: CreateAuthType, session?: ClientSession): Promise<void> {
      await this.model.create([data], { session });
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
      await this.model.updateOne(
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
      await this.model.updateOne(
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
