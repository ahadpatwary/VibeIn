import { z } from 'zod';
import { OtpPurpose } from './constants/constant';

const email = z.string().trim().toLowerCase().email();
const deviceId = z.string().min(1).max(128);

export const sendOtpSchema = z.object({ email, deviceId }).strict();

export const verifyOtpSchema = z
   .object({
      email,
      deviceId,
      otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
   })
   .strict();

export const registerCompleteSchema = z
   .object({
      email,
      token: z.string().min(1),
      password: z.string().min(8).max(72), // bcrypt limit; argon2 hole limit boshano jay
   })
   .strict();

export const passwordResetSchema = registerCompleteSchema;

export const loginSchema = z
   .object({
      email,
      deviceId,
      password: z.string().min(1).max(72),
   })
   .strict();

export const cooldownQuerySchema = z
   .object({
      email,
      deviceId,
      purpose: z.nativeEnum(OtpPurpose), // zod v4 e z.enum(OtpPurpose)
   })
   .strict();

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterCompleteInput = z.infer<typeof registerCompleteSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CooldownQuery = z.infer<typeof cooldownQuerySchema>;
