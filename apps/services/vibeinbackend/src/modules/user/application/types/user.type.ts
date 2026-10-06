import { IUser, UserResponseType } from '@app/contracts';
import { UserRole } from '@app/db-schemas';
import { Types } from 'mongoose';

export const toPublicUser = (u: UserResponseType): PublicUser => ({
   id: (u._id as Types.ObjectId).toString(),
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
