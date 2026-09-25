// import type { SoftDeletable } from '../plugins/base.plugin';
import type { HydratedDocument } from 'mongoose';

import type { UserRole, UserStatus } from '../constants/user.constant';

export type UserDocument = HydratedDocument<IUser>;

// export interface UserDocument extends Document, SoftDeletable {
//   email: string;
//   name: string;
//   role: UserRole;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface IEducation {
   college: string;
   degree: string;
}

export interface ISocialLink {
   platform: string;
   url: string;
}

export interface IAvatar {
   url: string;
   public_id: string;
}

export interface IUser {
   fullName: string;
   email: string;
   phoneNumber: string;

   bio?: string;

   avatar: IAvatar | null;

   education: IEducation[];
   skills: string[];
   socialLinks: ISocialLink[];

   roles: UserRole[];
   status: UserStatus;

   createdAt: Date;
   updatedAt: Date;
}
