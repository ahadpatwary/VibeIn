import { z } from "zod";
import { userSchema } from "./user.schema";

export const emailSchema = z.string().email("Invalid email").trim();

export const emailValidateSchema = z.object({
  email: emailSchema,
});


export const otpValidateSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .trim()
    .min(4, "OTP must be at least 4 digits")
    .max(6, "OTP must be maximum 6 digits"),
});


export const createAccountSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password max 20 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters")
      .max(20, "Confirm Password max 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], 
  })
;
// attach error to confirmPassword field

export const profileSchema = userSchema.pick({
  id: true,
  name: true,
  profilePicture: true,
});

export type EmailType = z.infer<typeof emailSchema>
export type EmailValidateType = z.infer<typeof emailValidateSchema>;
export type OtpValidateType = z.infer<typeof otpValidateSchema>;
export type CreateAccountType = z.infer<typeof createAccountSchema>;
export type ProfileType = z.infer<typeof profileSchema>;
