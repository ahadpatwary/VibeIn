import { jwtConfigOpt } from '../constants/constant';
import { TokenServiceConfig } from '../types/jwt.type';
import z from 'zod';

const tokenServiceSchema = z
   .object({
      secret: z.string().trim().min(2, 'secret must be required'),
      refreshSecret: z.string().trim().min(2, 'refresh secret must be required'),
   })
   .passthrough() satisfies z.ZodType<TokenServiceConfig>;

let cacheConfig: TokenServiceConfig | null = null;

export function loadTokenConfig(config: TokenServiceConfig): TokenServiceConfig {
   if (cacheConfig) return cacheConfig;

   const parsed = tokenServiceSchema.safeParse(config);

   if (parsed.error) {
      throw new Error(`Invalid Redis configuration: ${parsed.error.toString()}`);
   }

   cacheConfig = {
      ...jwtConfigOpt,
      ...parsed.data,
   };

   return cacheConfig;
}
