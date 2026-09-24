import { Schema, model } from 'mongoose';

import { AuthProvider } from '../constants/auth-provider';
import { IAuthIdentity } from '../types/auth-identity.types';

export const AuthIdentitySchema = new Schema<IAuthIdentity>(
   {
      userId: {
         type: Schema.Types.ObjectId,
         required: true,
         index: true,
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
         trim: true,
         lowercase: true,
         maxlength: 254,
      },

      linkedAt: {
         type: Date,
         default: Date.now,
         immutable: true,
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
   },
);

AuthIdentitySchema.index(
   {
      provider: 1,
      providerId: 1,
   },
   {
      unique: true,
      name: 'auth_identity_provider_id_unique',
   },
);

AuthIdentitySchema.index(
   {
      userId: 1,
   },
   {
      name: 'auth_identity_user_id_idx',
   },
);

export const AuthIdentityModel = model<IAuthIdentity>('AuthIdentity', AuthIdentitySchema);
