import { z } from 'zod';

export const refreshTokenPayloadSchema = z.object({
   sub: z.string().trim().min(4),

   sid: z.string().trim().min(5),
   jti: z.string().trim().min(5),

   accountId: z.string().trim().min(4),
   deviceId: z.string().trim().min(4),

   role: z.enum(['user', 'moderator', 'admin']),
});

export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;
