import { IUser, UserSchema } from '@app/db-schemas';
import { DB_TOKENS, MongooseClient } from '@app/mongo';
import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { UserRepository } from '../../application/interfaces/user.interface';
import { CreateUserInput } from '../../application/schemas/user.schema';

@Injectable()
export class MongoUserRepository implements UserRepository {
   private readonly userModel: Model<IUser>;

   constructor(
      @Inject(DB_TOKENS.MongooseClient)
      private readonly mongooseClient: MongooseClient,
   ) {
      this.userModel = this.mongooseClient.getConnection().model<IUser>('User', UserSchema);
   }

   async createUser(userInput: CreateUserInput) {
      const created = await this.userModel.create(userInput);
      // return new User(created._id.toString(), created.name, created.email, created.roles);
      return created;
   }
}
