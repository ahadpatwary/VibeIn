import type { ClientSession } from 'mongoose';
import { CreateUserInput } from '../schemas/user.schema';
import { UserDocument } from '@app/db-schemas';

export interface UserRepository {
    createUser(
        data: CreateUserInput,
        session?: ClientSession,
    ): Promise<UserDocument>;

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