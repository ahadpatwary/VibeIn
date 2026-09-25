import z from 'zod';

import { REDIS_CONFIG } from '../constants/redis.constants';
import type { RedisConfig } from '../types/redis.types';

const RedisConfigSchema = z
   .object({
      host: z.string().trim().min(1, 'Host name is required!'),
      port: z.number().transform((port: number, ctx: z.core.$RefinementCtx<number>) => {
         if (port < 1 || port > 65535) {
            ctx.addIssue('post is not valid');
         }
         return port;
      }),
   })
   .passthrough();

let cachedConfig: RedisConfig | null = null;

export function loadRedisConfig(cfg: RedisConfig): RedisConfig {
   if (cachedConfig) return cachedConfig;

   const parsed = RedisConfigSchema.safeParse(cfg);

   if (!parsed.success) {
      throw new Error(`Invalid Redis configuration: ${parsed.error.toString()}`);
   }

   cachedConfig = {
      ...REDIS_CONFIG,
      ...parsed.data,
   };

   return cachedConfig;
}
