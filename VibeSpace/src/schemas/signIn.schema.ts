import { z } from 'zod'
import { userSchema } from './user.schema'

export const emailSchema = z.string().email().trim();

export const emailValidateSchema = z.object({
    email: emailSchema
})

export const otpValidateSchema = z.object({
    email: emailSchema,
    otp: z.string().trim()
})

export const createAccountSchema = z.object({
    email: emailSchema,
    password: z.string().min(6).max(10),
    confrimPassword: z.string().min(6).max(10)
})

export const profileSchema = userSchema.pick({
    name: true,
    profilePicture: true,
    phoneNumber: true,
})