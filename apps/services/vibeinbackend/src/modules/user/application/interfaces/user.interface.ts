import type { UserDocument } from '@app/db-schemas';
import type { ClientSession } from 'mongoose';

import type { CreateUserInput } from '../schemas/user.schema';

export interface UserRepository {
   createUser(data: CreateUserInput, session?: ClientSession): Promise<UserDocument>;

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
