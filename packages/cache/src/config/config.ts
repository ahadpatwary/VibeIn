import z from 'zod';
import { RedisConfig } from '../types/redis.types';
import { REDIS_CONFIG, REDIS_CONSTANTS } from '../constants/redis.constants';

const RedisConfigSchema = z
   .object({
      host: z.string().trim().min(1, 'Host name is required!'),
      port: z.number().transform((port: number, ctx: z.core.$RefinementCtx<number>): any => {
         if (port < 1 || port > 65535) {
            return `port: ${port} is invalid. Port should be between 1 to 65535`;
         }
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
