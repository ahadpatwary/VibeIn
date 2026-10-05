import { model, Schema } from 'mongoose';

import { AuthProvider } from '../constants/auth-provider';
import type { IAuthIdentity } from '../types/auth-identity.types';

const isCredentials = function (this: IAuthIdentity): boolean {
   return this.provider === AuthProvider.Credentials;
};

export const AuthIdentitySchema = new Schema<IAuthIdentity>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: true,
      },

      provider: {
         type: String,
         enum: Object.values(AuthProvider),
         required: true,
      },

      providerId: {
         type: String,
         required: true,
         trim: true,
         maxlength: 255,
      },

      providerEmail: {
         type: String,
         required: true,
         trim: true,
         lowercase: true,
         maxlength: 254,
      },

      passwordHash: {
         type: String,
         /** -> kokhono accidentally query/response e jabe na */
         select: false,
         required: isCredentials,
      },

      lastLoginAt: {
         type: Date,
      },
   },
   {
      collection: 'auth_identities',
      timestamps: true,
      versionKey: false,
      strict: true,
      toJSON: {
         transform: (_doc, ret: Record<string, unknown>) => {
            delete ret.passwordHash;
            delete ret.failedLoginAttempts;
            delete ret.lockedUntil;
            return ret;
         },
      },
   },
);

// Provider-specific field gulo cross-check
AuthIdentitySchema.pre('validate', function (next) {
   if (this.provider !== AuthProvider.Credentials && this.passwordHash) {
      return next(new Error('passwordHash is only allowed for the credentials provider'));
   }

   if (this.provider === AuthProvider.Credentials && !this.passwordHash) {
      return next(new Error('passwordHash is required for the credential'));
   }

   next();
});

// Login lookup: (provider, providerId) -> ekta identity
AuthIdentitySchema.index(
   { provider: 1, providerId: 1 },
   { unique: true, name: 'auth_identity_provider_id_unique' },
);

// Ekta user er per provider max 1 identity (1 credentials, 1 google, ...)
// Eta userId-only lookup o cover kore (prefix), tai alada userId index lagbe na
AuthIdentitySchema.index(
   { userId: 1, provider: 1 },
   { unique: true, name: 'auth_identity_user_provider_unique' },
);

export const AuthIdentityModel = model<IAuthIdentity>('AuthIdentity', AuthIdentitySchema);
