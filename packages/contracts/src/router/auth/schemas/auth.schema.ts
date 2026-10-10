import { z } from 'zod';

import { userSchema } from '../../user/schemas/user.schema';

const email = z.string().trim().toLowerCase().email();
const deviceId = z.string().min(1).max(128);

export const sendOtpSchema = z.object({ email, deviceId }).strict();

export const sendOtpReturnSchema = z.object({
   cooldownSeconds: z.number().int().nonnegative(),
});

export const verifyOtpSchema = z
   .object({
      email,
      deviceId,
      otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
   })
   .strict();

export const verifyOtpReturnSchema = z.object({
   verifyToken: z.string().min(1),
});

export const registerWithCredentialSchema = z.object({
   email: email,
   password: z.string().min(6),
});

export const returnUserSchema = userSchema.pick({
   fullName: true,
   email: true,
   avatar: true,
   bio: true,
   phoneNumber: true,
});

export const registerWithCredentialReturnSchema = z.object({
   user: returnUserSchema,
   accessToken: z.string().min(1),
});

export const loginWithCredentialSchema = z.object({
   email: email,
   password: z.string().min(6),
});

export const loginWithCredentialReturnSchema = z.object({
   user: returnUserSchema,
   accessToken: z.string().min(1),
});

export type RegsiterWithCredentialType = z.infer<typeof registerWithCredentialSchema>;
export type RegisterWithCredentialReturnType = z.infer<typeof registerWithCredentialReturnSchema>;
export type SendOtpType = z.infer<typeof sendOtpSchema>;
export type VerifyOtpType = z.infer<typeof verifyOtpSchema>;
export type VerifyOtpReturnType = z.infer<typeof verifyOtpReturnSchema>;
export type SendOtpReturnType = z.infer<typeof sendOtpReturnSchema>;
export type LoginWithCredentialType = z.infer<typeof loginWithCredentialSchema>;
export type LoginWithCredentialReturnType = z.infer<typeof loginWithCredentialReturnSchema>;
