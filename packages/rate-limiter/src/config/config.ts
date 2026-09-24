import { z } from 'zod';

import type { RateLimiterOptions } from '../types/types';

export const RateLimitConfigSchema = z.object({
   enablePenalty: z.boolean().default(true),
   penaltyThreshold: z.number().positive().default(3000),
   failOpen: z.boolean().default(true),
});

let cachedConfig: RateLimiterOptions | null = null;

export function loadGlocalOption(cfg: RateLimiterOptions): RateLimiterOptions {
   if (cachedConfig) return cachedConfig;

   const parsed = RateLimitConfigSchema.safeParse(cfg);

   if (!parsed.success) {
      throw new Error(`Invalid Redis configuration: ${parsed.error.toString()}`);
   }

   cachedConfig = {
      ...parsed.data,
   };

   return parsed.data;
}
