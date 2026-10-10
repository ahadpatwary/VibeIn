import { z } from 'zod';
import { Platform, RevokeReason, SessionStatus, TTL } from '../constants/constant';

export const revokeReasonSchema = z.enum(Object.values(RevokeReason));

export const sessionDataSchema = z
   .object({
      sessionId: z.string().trim().min(5),

      userId: z.string().trim().min(4),
      email: z.string().trim().email(),
      deviceId: z.string().trim().min(4),
      refreshToken: z.string().trim().min(4),
      status: z.enum(Object.values(SessionStatus)),
      reason: revokeReasonSchema.optional(),
      createdAt: z.coerce
         .number()
         .int()
         .min(1)
         .default(() => Date.now())
         .optional(),
      expiredAt: z.coerce
         .number()
         .int()
         .min(1)
         .default(() => Date.now() + TTL.session)
         .optional(),

      platform: z.enum(Object.values(Platform)).optional(),
      browser: z.string().trim().min(3).optional(),
      ip: z.string().trim().min(7).optional(),
   })
   .superRefine((data, ctx) => {
      if (data.status === SessionStatus.REVOKED && !data.reason) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reason'],
            message: 'Reason is required when session is revoked',
         });
      }

      if (data.status !== SessionStatus.REVOKED && data.reason) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['reason'],
            message: 'Reason can only be provided when status is REVOKED',
         });
      }
   });

export type RevokeReasonType = z.infer<typeof revokeReasonSchema>;
export type SessionData = z.infer<typeof sessionDataSchema>;
