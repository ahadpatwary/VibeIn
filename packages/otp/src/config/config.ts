import z from 'zod';

import { otpConfig } from '../constants/constant';
import type { OtpConfig } from '../types/type';

export const otpConfigSchema = z.object({
   otpLength: z.number().positive(),
   otpTtlMs: z.number().positive(),
   bcryptRounds: z.number().positive(),
   lockTtlSeconds: z.number().positive(),
   maxAttempts: z.number().positive(),
   verifyTokenTtl: z.number().positive(),
});

let cacheConfig: OtpConfig | null = null;

export function loadOtpConfig(config: Partial<OtpConfig>): OtpConfig {
   if (cacheConfig) return cacheConfig;

   cacheConfig = {
      ...otpConfig,
      ...config,
   };

   const parsed = otpConfigSchema.safeParse(cacheConfig);

   if (parsed.error) {
      throw new Error(`Opt config dosen't get the required property: ${parsed.error}`);
   }

   return cacheConfig;
}
