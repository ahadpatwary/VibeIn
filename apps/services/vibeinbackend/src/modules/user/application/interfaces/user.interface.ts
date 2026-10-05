import type { ClientSession } from 'mongoose';

import type { CreateUserInput } from '../schemas/user.schema';
import { IUser } from '@app/db-schemas';

export interface UserRepository {
   createUser(data: CreateUserInput, session?: ClientSession): Promise<IUser>;

   // findById(
   //     id: string,
   //     session?: ClientSession,
   // ): Promise<UserDocument | null>;

   // updateById(
   //     id: string,
   //     data: Partial<CreateUserInput>,
   //     session?: ClientSession,
   // ): Promise<UserDocument | null>;
}
