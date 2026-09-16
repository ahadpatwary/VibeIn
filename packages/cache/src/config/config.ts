import z from 'zod'
import { RedisConfig } from '../types/redis.types';

const RedisConfigSchema = z.object({
    host: z.string().trim().min(1, 'Host name is required!'),
    port: z.number().transform((port: number, ctx: z.core.$RefinementCtx<number>): any => {
        if (port < 1 || port > 65535) {
            return `port: ${port} is invalid. Port should be between 1 to 65535`;
        }
    })
})

let cachedConfig: RedisConfig | null = null;


export function loadRedisConfig(env: NodeJS.ProcessEnv = process.env): RedisConfig {
    if(cachedConfig) return cachedConfig;

    const parsed = RedisConfigSchema.safeParse(env);

    if (!parsed.success) {
        throw new Error(`Invalid Redis configuration: ${parsed.error.toString()}`);
    }

    cachedConfig = {
        ...env,
        ...parsed.data,
    }

    return cachedConfig;

}