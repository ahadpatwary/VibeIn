import type { Types } from 'mongoose';

import type { AuthProvider } from '../constants/auth-provider';

export interface IAuthIdentity {
   userId: Types.ObjectId;
   provider: AuthProvider;

   /**
    * Stable identifier supplied by the OAuth provider.
    *
    * IMPORTANT:
    * Never use email as the provider identity.
    */
   providerId: string;

   /**
    * Provider-reported email.
    *
    * This can change and therefore must NOT be used
    * as the provider identity.
    */
   providerEmail?: string;

   linkedAt: Date;

   lastLoginAt?: Date;
}
