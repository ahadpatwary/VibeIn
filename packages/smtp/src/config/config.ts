import z from 'zod';

import type { ResendConfig } from '../types/resend.type';

const resendConfigSchema = z
   .object({
      key: z.string().trim().min(2, 'Api key must be required'),
   })
   .passthrough();

let cacheConfig: ResendConfig | null = null;

export function loadResedConfig(config: ResendConfig): ResendConfig {
   if (cacheConfig) return cacheConfig;

   const parsed = resendConfigSchema.safeParse(config);

   if (parsed.error) {
      throw new Error(`resend config setup error: ${parsed.error}`);
   }

   cacheConfig = {
      ...parsed.data,
   };

   return cacheConfig;
}
