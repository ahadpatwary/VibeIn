import { z } from 'zod';
import { Platform } from './request-context.constant';

export const clientMetaDataSchema = z.object({
   deviceId: z.string().trim().min(1, 'deviceId must be required'),
   clientType: z.enum(Object.values(Platform)).optional(),
   appVersion: z.string().optional(),
   userAgent: z.string().optional(),
   ip: z.string().optional(),
});

export const requestContextSchema = clientMetaDataSchema.extend({
   requestId: z.string().trim().min(1, 'requestId must be required'),
   clientType: z.enum(Object.values(Platform)).default(Platform.UNKNOWN).optional(),
});

export type ClientMetaDataType = z.infer<typeof clientMetaDataSchema>;
export type RequestContextType = z.infer<typeof requestContextSchema>;
