import { z } from 'zod'

export const providerEnum = z.enum([
  "credentials",
  "google",
  "github",
]);

export const profilePictureSchema = z.object({
  url: z.string().trim().default(""),
  public_id: z.string().trim().default(""),
});

export const userSchema = z.object({
  name: z.string().trim().default("User"),
  email: z.string().trim().email(),
  provider: providerEnum,
  password: z.string().min(6).nullable(),
  phoneNumber: z.string().trim().optional(),
  profilePicture: profilePictureSchema,
  dateOfBirth: z.coerce.date().optional(),
  friendsCount: z.number().int().nonnegative().default(0),
});