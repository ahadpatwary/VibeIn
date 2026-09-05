import { RedisSerializationException } from '../index.js';

export class RedisSerializer {
    /**
     * Serialize any value to a string for Redis storage.
     * Primitives are stored as-is; objects/arrays are JSON stringified.
     */
    static serialize<T>(value: T): string {
        try {
            if (value === null || value === undefined) {
                return JSON.stringify(null);
            }

            if (typeof value === 'string') {
                return value;
            }

            if (typeof value === 'number' || typeof value === 'boolean') {
                return String(value);
            }

            return JSON.stringify(value);
        } catch (err) {
            throw new RedisSerializationException('serialize', err as Error, {
                valueType: typeof value,
            });
        }
    }

    /**
     * Deserialize a string from Redis to the original type.
     */
    static deserialize<T>(value: string | null): T | null {
        if (value === null) return null;

        try {
            // Try JSON parse first (handles objects, arrays, booleans, numbers)
            return JSON.parse(value) as T;
        } catch {
            // Fallback: return as string (handles plain strings not JSON encoded)
            return value as unknown as T;
        }
    }

    /**
     * Safely deserialize, returning a default value on failure.
     */
    static safeDeserialize<T>(value: string | null, defaultValue: T): T {
        try {
            const result = RedisSerializer.deserialize<T>(value);
            return result ?? defaultValue;
        } catch {
            return defaultValue;
        }
    }

    /**
     * Serialize a hash (object) to a flat string array for HSET.
     * Redis HSET accepts: key field1 value1 field2 value2 ...
     */
    static serializeHash(data: Record<string, unknown>): string[] {
        const result: string[] = [];
        for (const [field, value] of Object.entries(data)) {
            result.push(field, RedisSerializer.serialize(value));
        }
        return result;
    }

    /**
     * Deserialize a flat string array from HGETALL to a typed object.
     */
    static deserializeHash<T extends Record<string, unknown>>(
        data: Record<string, string>,
    ): T {
        const result: Record<string, unknown> = {};
        for (const [field, value] of Object.entries(data)) {
            result[field] = RedisSerializer.deserialize(value);
        }
        return result as T;
    }
}
