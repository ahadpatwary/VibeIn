import { z } from 'zod';

export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
   z.object({
      success: z.literal(true),
      data: dataSchema,
   });

export const ApiErrorResponseSchema = z.object({
   success: z.literal(false),

   error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.unknown().nullable(),
      requestId: z.string().nullable(),
   }),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
