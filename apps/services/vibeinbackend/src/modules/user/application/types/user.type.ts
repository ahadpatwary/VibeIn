import { IUser, UserRole } from '@app/db-schemas';
import { Types } from 'mongoose';

export interface UserResponse {
   id: string;
   name: string;
   email: string;
   roles: string[];
}

export type UserRecord = IUser & { _id: Types.ObjectId };

export type NewUser = Omit<IUser, 'createdAt' | 'updatedAt'>;
export const toPublicUser = (u: UserRecord): PublicUser => ({
   id: u._id.toString(),
   fullName: u.fullName,
   email: u.email,
   avatar: u.avatar,
   roles: u.roles,
});

export interface PublicUser {
   id: string;
   fullName: string;
   email: string;
   avatar?: IUser['avatar'];
   roles: UserRole;
}
