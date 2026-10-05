import type { Types } from 'mongoose';

import type { AuthProvider } from '../constants/auth-provider';

export interface IAuthIdentity {
   userId: Types.ObjectId;
   provider: AuthProvider;

   providerId: string;

   providerEmail: string;

   // ---- credentials only ----
   passwordHash?: string;

   lastLoginAt?: Date;

   createdAt: Date;
   updatedAt: Date;
}
