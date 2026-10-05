import { UserSchema, type IUser } from '@app/db-schemas';
import type { ClientSession, Model, Types } from 'mongoose';
import type { NewUser, UserRecord } from '../../application/types/user.type';
import { Inject, Injectable } from '@nestjs/common';
import { DB_TOKENS, MongooseClient } from '@app/mongo';

@Injectable()
export class UserRepository {
   private readonly userModel: Model<IUser>;

   constructor(
      @Inject(DB_TOKENS.MongooseClient)
      private readonly mongooseClient: MongooseClient,
   ) {
      this.userModel = this.mongooseClient.getConnection().model<IUser>('User', UserSchema);
   }

   findByEmail(email: string, session?: ClientSession): Promise<UserRecord | null> {
      return this.userModel
         .findOne({ email })
         .session(session ?? null)
         .lean<UserRecord>()
         .exec();
   }

   findById(id: Types.ObjectId | string, session?: ClientSession): Promise<UserRecord | null> {
      return this.userModel
         .findById(id)
         .session(session ?? null)
         .lean<UserRecord>()
         .exec();
   }

   async create(data: NewUser, session?: ClientSession): Promise<UserRecord> {
      const [doc] = await this.userModel.create([data], { session });

      return doc.toObject();
   }
}
