import { UserRole } from '@app/db-schemas';
import { z } from 'zod';

export const accessTokenPayloadSchema = z.object({
   sub: z.string().trim().min(4),
   sid: z.string().trim().min(5),
   jti: z.string().trim().min(5),

   deviceId: z.string().trim().min(4),

   role: z.enum(Object.values(UserRole)),

   name: z.string().trim().min(3),
   email: z.string().trim().email(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
