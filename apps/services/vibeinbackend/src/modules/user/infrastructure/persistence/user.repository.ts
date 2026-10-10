import { UserSchema } from '@app/db-schemas';
import type { ClientSession, Model, Types } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { DB_TOKENS, MongooseClient } from '@app/mongo';
import { CreateUserType, IUser, UserResponseType } from '@app/contracts';

@Injectable()
export class UserRepository {
   private readonly userModel: Model<IUser>;

   constructor(
      @Inject(DB_TOKENS.MongooseClient)
      private readonly mongooseClient: MongooseClient,
   ) {
      this.userModel = this.mongooseClient.getConnection().model<IUser>('User', UserSchema);
   }

   findByEmail(email: string, session?: ClientSession): Promise<UserResponseType | null> {
      return this.userModel
         .findOne({ email })
         .session(session ?? null)
         .lean<UserResponseType>()
         .exec();
   }

   findById(
      id: Types.ObjectId | string,
      session?: ClientSession,
   ): Promise<UserResponseType | null> {
      return this.userModel
         .findById(id)
         .session(session ?? null)
         .lean<UserResponseType>()
         .exec();
   }

   async create(data: CreateUserType, session?: ClientSession): Promise<UserResponseType> {
      const [doc] = await this.userModel.create([data], { session });

      if (!doc) throw new Error(`user can't created successfully`);

      const userObject = doc.toObject();

      /** _removed is not assignable error asche lint korle how to fix if */
      const { __v, ...safeUser } = userObject;
      console.log(__v);

      return safeUser as UserResponseType;
   }
}
