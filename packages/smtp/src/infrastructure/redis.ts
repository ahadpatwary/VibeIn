import { Redis } from 'ioredis';
import { withCommandError } from '../../cache/decorators/retry.decorator.js';
import { RedisSerializer } from '../../cache/utils/redis.serializer.js';

export class ResendRedisService {
    constructor(private readonly client: Redis | null = null) {}

    async getTemplateHash<T extends Record<string, unknown>>(
        key: string,
    ): Promise<Record<string, unknown>> {
        return withCommandError('HGETALL', async () => {
            const data = await this.client?.hgetall(key);
            return RedisSerializer.deserializeHash<T>(data ?? {});
        });
    }

    async setTemplateHash(
        key: string,
        data: Record<string, unknown>,
    ): Promise<void> {
        return withCommandError('HMSET', async () => {
            const serialized = RedisSerializer.serializeHash(data);
            await this.client?.hset(key, ...serialized);
        });
    }
}
