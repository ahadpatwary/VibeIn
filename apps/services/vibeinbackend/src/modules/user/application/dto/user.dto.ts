import { z } from 'zod';

export const createUserDto = z.object({
  name: z.string().trim().optional(),

  phoneNumber: z.string().trim().optional(),

  profilePicture: z
    .object({
      url: z.string().nullable().optional(),
      public_id: z.string().nullable().optional(),
    })
    .optional(),

  dateOfBirth: z.date().optional(),

});

export class CreateUserBody {
  name: string;
  phoneNumber?: string | undefined;
  profilePicture?: {
    url?: string | null | undefined;
    public_id?: string | null | undefined;
  } | undefined;
  dateOfBirth?: Date | undefined;
  friendsCount: number;
}

export type CreateUserDto = z.infer<typeof createUserDto>;