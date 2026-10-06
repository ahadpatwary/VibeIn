import { z } from 'zod';

import { AuthProvider } from '../constants/constant';

const providerSchema = z.enum(Object.values(AuthProvider) as [AuthProvider, ...AuthProvider[]]);

const providerIdSchema = z.string().trim().min(1).max(255);

const providerEmailSchema = z.string().trim().toLowerCase().email().max(254);

const passwordHashSchema = z.string().min(1);

const lastLoginAtSchema = z.date().optional();

const authIdentityBaseSchema = z.object({
   _id: z.unknown(),

   userId: z.unknown(),

   providerId: providerIdSchema,

   providerEmail: providerEmailSchema,

   lastLoginAt: lastLoginAtSchema,

   createdAt: z.date(),

   updatedAt: z.date(),
});

const credentialsIdentitySchema = authIdentityBaseSchema.extend({
   provider: z.literal(AuthProvider.Credentials),

   passwordHash: passwordHashSchema,
});

const oauthIdentitySchema = authIdentityBaseSchema.extend({
   provider: providerSchema.exclude([AuthProvider.Credentials]),

   passwordHash: z.never().optional(),
});

export const AuthIdentitySchema = z.discriminatedUnion('provider', [
   credentialsIdentitySchema,
   oauthIdentitySchema,
]);

const authIdentityCreateBaseSchema = z.object({
   userId: z.unknown(),

   providerId: providerIdSchema,

   providerEmail: providerEmailSchema,

   lastLoginAt: lastLoginAtSchema,
});

const credentialsIdentityCreateSchema = authIdentityCreateBaseSchema.extend({
   provider: z.literal(AuthProvider.Credentials),

   passwordHash: passwordHashSchema,
});

const oauthIdentityCreateSchema = authIdentityCreateBaseSchema.extend({
   provider: providerSchema.exclude([AuthProvider.Credentials]),

   passwordHash: z.never().optional(),
});

export const CreateAuthIdentitySchema = z.discriminatedUnion('provider', [
   credentialsIdentityCreateSchema,
   oauthIdentityCreateSchema,
]);

export const resonseAuthForCredentialSchema = credentialsIdentitySchema;

export const PublicAuthIdentitySchema = z.object({
   _id: z.unknown(),

   userId: z.unknown(),

   provider: providerSchema,

   providerId: providerIdSchema,

   providerEmail: providerEmailSchema,

   lastLoginAt: lastLoginAtSchema,

   createdAt: z.date(),

   updatedAt: z.date(),
});

export type AuthIdentity = z.infer<typeof AuthIdentitySchema>;

export type CreateAuthIdentity = z.infer<typeof CreateAuthIdentitySchema>;

export type PublicAuthIdentity = z.infer<typeof PublicAuthIdentitySchema>;

// export type ResonseAuthForCredentialType = z.infer<typeof resonseAuthForCredentialSchema>
