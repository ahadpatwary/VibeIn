import { z } from 'zod';

export const OTP_LENGTH = 6;

export const emailSchema = z.object({
   email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .max(254, 'Email is too long')
      .email('Enter a valid email address')
      .transform((value) => value.toLowerCase()),
});
export type EmailValues = z.infer<typeof emailSchema>;

export const loginSchema = emailSchema.extend({
   password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const otpSchema = z
   .string()
   .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`);

/** Single source of truth for the rules shown in the checklist AND enforced by the schema. */
export const PASSWORD_RULES = [
   { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
   {
      id: 'case',
      label: 'Upper and lowercase letters',
      test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v),
   },
   { id: 'number', label: 'At least one number', test: (v: string) => /\d/.test(v) },
] as const;

export const newPasswordSchema = z
   .object({
      password: z
         .string()
         .max(72, 'Password must be 72 characters or fewer')
         .refine(
            (value) => PASSWORD_RULES.every((rule) => rule.test(value)),
            'Password does not meet the requirements',
         ),
      confirmPassword: z.string().min(1, 'Confirm your password'),
   })
   .refine((values) => values.password === values.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
   });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
