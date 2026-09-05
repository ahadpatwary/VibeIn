import { inject, injectable } from 'tsyringe';
import Redis, { ChainableCommander, ReplyError } from 'ioredis';
import {
    HashScanResult,
    Nullable,
    RedisPipelineResult,
    ScanOptions,
    ScanResult,
    SetOptions,
    ZMember,
    ZRangeOptions,
    type RedisConfig,
} from './types/redis.types.js';
import { type RedisClientManager } from './redis.client.js';
import { Retry } from './decorators/retry.decorator.js';
import { RedisSerializer } from './utils/redis.serializer.js';
import { REDIS_CONSTANTS } from './constants/redis.constants.js';
import { RedisCommandException } from './exceptions/redis.exception.js';

@injectable()
export class RedisService {
    constructor(
        @inject('RedisClientManager')
        private readonly client: RedisClientManager,
        @inject('RedisLogger')
        private readonly logger: any, //TODO: Replace 'any' with the actual type of your logger if available
    ) {}

    async commandWraper<T>(
        command: string,
        fn: (client: Redis) => Promise<T>,
    ): Promise<T> {
        const client = await this.client.getClient();

        try {
            return await fn(client);
        } catch (err) {
            if (err instanceof RedisCommandException) throw err;
            throw new RedisCommandException(command, err as Error);
        }

    }


    async set<T>(
        key: string,
        value: T,
        options?: SetOptions,
    ): Promise<'OK' | null> {
        return this.commandWraper('SET', async (client: Redis) => {
            const serialized = RedisSerializer.serialize(value);

            if (!options || Object.keys(options).length === 0) {
                return client.set(key, serialized);
            }

            const args: (string | number)[] = [];

            if (options.ex !== undefined) args.push('EX', options.ex);
            else if (options.px !== undefined) args.push('PX', options.px);
            else if (options.exat !== undefined)
                args.push('EXAT', options.exat);
            else if (options.pxat !== undefined)
                args.push('PXAT', options.pxat);
            else if (options.keepttl) args.push('KEEPTTL');
            if (options.nx) args.push('NX');
            else if (options.xx) args.push('XX');

            return client.call('SET', key, serialized, ...args) as Promise<
                'OK' | null
            >;
        });
    }

    async get<T = string>(key: string): Promise<Nullable<T>> {
        //Nullable<T> = null | T
        return this.commandWraper('GET', async (client: Redis) => {
            const value = await client.get(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async getRaw(key: string): Promise<Nullable<string>> {
        return this.commandWraper('GET', (client: Redis) => client.get(key));
    }

    async setNX<T>(
        key: string,
        value: T,
        ttlSeconds?: number,
    ): Promise<boolean> {
        return this.commandWraper('SETNX', async (client: Redis) => {
            const serialized = RedisSerializer.serialize(value);
            if (ttlSeconds !== undefined) {
                const result = await client.set(
                    key,
                    serialized,
                    'EX',
                    ttlSeconds,
                    'NX',
                );
                return result === 'OK';
            }
            const result = await client.setnx(key, serialized);
            return result === 1;
        });
    }

    async mSet(pairs: Record<string, unknown>): Promise<void> {
        return this.commandWraper('MSET', async (client: Redis) => {
            const args: string[] = [];
            for (const [key, value] of Object.entries(pairs)) {
                args.push(key, RedisSerializer.serialize(value));
            }
            await client.mset(...args);
        });
    }

    async mGet<T = string>(keys: string[]): Promise<Array<Nullable<T>>> {
        return this.commandWraper('MGET', async (client: Redis) => {
            const values = await client.mget(...keys);
            return values.map((v) => RedisSerializer.deserialize<T>(v));
        });
    }

    async incr(key: string): Promise<number> {
        return this.commandWraper('INCR', (client: Redis) => client.incr(key));
    }

    async incrBy(key: string, increment: number): Promise<number> {
        return this.commandWraper('INCRBY', (client: Redis) =>
            client.incrby(key, increment),
        );
    }

    async incrByFloat(key: string, increment: number): Promise<string> {
        return this.commandWraper('INCRBYFLOAT', (client: Redis) =>
            client.incrbyfloat(key, increment),
        );
    }

    async decr(key: string): Promise<number> {
        return this.commandWraper('DECR', (client: Redis) => client.decr(key));
    }

    async decrBy(key: string, decrement: number): Promise<number> {
        return this.commandWraper('DECRBY', (client: Redis) =>
            client.decrby(key, decrement),
        );
    }

    async append(key: string, value: string): Promise<number> {
        return this.commandWraper('APPEND', (client: Redis) => client.append(key, value));
    }

    async strlen(key: string): Promise<number> {
        return this.commandWraper('STRLEN', (client: Redis) => client.strlen(key));
    }

    async getDel<T = string>(key: string): Promise<Nullable<T>> {
        return this.commandWraper('GETDEL', async (client: Redis) => {
            const value = await client.getdel(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async getSet<T = string>(key: string, newValue: T): Promise<Nullable<T>> {
        return this.commandWraper('GETSET', async (client: Redis) => {
            const value = await client.getset(
                key,
                RedisSerializer.serialize(newValue),
            );
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async del(...keys: string[]): Promise<number> {
        return this.commandWraper('DEL', (client: Redis) => client.del(...keys));
    }

    async exists(...keys: string[]): Promise<number> {
        return this.commandWraper('EXISTS', (client: Redis) => client.exists(...keys));
    }

    async hasKey(key: string): Promise<boolean> {
        return this.commandWraper('EXISTS', async (client: Redis) => {
            const count = await client.exists(key);
            return count > 0;
        });
    }

    async expire(
        key: string,
        seconds: number,
        mode?: 'NX' | 'XX' | 'GT' | 'LT',
    ): Promise<boolean> {
        return this.commandWraper('EXPIRE', async (client: Redis) => {
            const result = mode
                ? ((await client.call(
                      'EXPIRE',
                      key,
                      seconds,
                      mode,
                  )) as number)
                : await client.expire(key, seconds);
            return result === 1;
        });
    }

    async pExpire(key: string, milliseconds: number): Promise<boolean> {
        return this.commandWraper('PEXPIRE', async (client: Redis) => {
            const result = await client.pexpire(key, milliseconds);
            return result === 1;
        });
    }

    async expireAt(key: string, timestamp: number): Promise<boolean> {
        return this.commandWraper('EXPIREAT', async (client: Redis) => {
            const result = await client.expireat(key, timestamp);
            return result === 1;
        });
    }

    async persist(key: string): Promise<boolean> {
        return this.commandWraper('PERSIST', async (client: Redis) => {
            const result = await client.persist(key);
            return result === 1;
        });
    }

    async ttl(key: string): Promise<number> {
        return this.commandWraper('TTL', (client: Redis) => client.ttl(key));
    }

    async pTtl(key: string): Promise<number> {
        return this.commandWraper('PTTL', (client: Redis) => client.pttl(key));
    }

    async rename(key: string, newKey: string): Promise<void> {
        return this.commandWraper('RENAME', async (client: Redis) => {
            await client.rename(key, newKey);
        });
    }

    async renameNX(key: string, newKey: string): Promise<boolean> {
        return this.commandWraper('RENAMENX', async (client: Redis) => {
            const result = await client.renamenx(key, newKey);
            return result === 1;
        });
    }

    async type(key: string): Promise<string> {
        return this.commandWraper('TYPE', (client: Redis) => client.type(key));
    }

    async randomKey(): Promise<Nullable<string>> {
        return this.commandWraper('RANDOMKEY', (client: Redis) => client.randomkey());
    }

    async copy(
        source: string,
        destination: string,
        replace?: boolean,
    ): Promise<boolean> {
        return this.commandWraper('COPY', async (client: Redis) => {
            const args: (string | number)[] = replace ? ['REPLACE'] : [];
            const result = (await client.call(
                'COPY',
                source,
                destination,
                ...args,
            )) as number;
            return result === 1;
        });
    }

    async scan(pattern: string, options?: ScanOptions): Promise<string[]> {
        return this.commandWraper('SCAN', async (client: Redis) => {
            const allKeys: string[] = [];
            let cursor = '0';

            do {
                const args: (string | number)[] = [
                    cursor,
                    'MATCH',
                    options?.match ?? pattern,
                    'COUNT',
                    options?.count ?? REDIS_CONSTANTS.SCAN_DEFAULT_COUNT,
                ];
                if (options?.type) args.push('TYPE', options.type);

                const result = (await client.call('SCAN', ...args)) as [
                    string,
                    string[],
                ];
                cursor = result[0];
                allKeys.push(...result[1]);
            } while (cursor !== '0');

            return allKeys;
        });
    }

    async scanBatch(
        cursor: string,
        pattern: string,
        count = REDIS_CONSTANTS.SCAN_DEFAULT_COUNT,
    ): Promise<ScanResult> {
        return this.commandWraper('SCAN', async (client: Redis) => {
            const [nextCursor, keys] = await client.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                count,
            );
            return { cursor: nextCursor, keys };
        });
    }

    async hSet(key: string, field: string, value: unknown): Promise<number> {
        return this.commandWraper('HSET', (client: Redis) =>
            client.hset(key, field, RedisSerializer.serialize(value)),
        );
    }

    async hMSet(key: string, data: Record<string, unknown>): Promise<void> {
        return this.commandWraper('HMSET', async (client: Redis) => {
            const serialized = RedisSerializer.serializeHash(data);
            await client.hset(key, ...serialized);
        });
    }

    async hGet<T = string>(key: string, field: string): Promise<Nullable<T>> {
        return this.commandWraper('HGET', async (client: Redis) => {
            const value = await client.hget(key, field);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async hMGet<T = string>(
        key: string,
        ...fields: string[]
    ): Promise<Array<Nullable<T>>> {
        return this.commandWraper('HMGET', async (client: Redis) => {
            const values = await client.hmget(key, ...fields);
            return values.map((v) => RedisSerializer.deserialize<T>(v));
        });
    }

    async hGetAll<T extends Record<string, unknown>>(key: string): Promise<T> {
        return this.commandWraper('HGETALL', async (client: Redis) => {
            const data = await client.hgetall(key);
            return RedisSerializer.deserializeHash<T>(data ?? {});
        });
    }

    async hDel(key: string, ...fields: string[]): Promise<number> {
        return this.commandWraper('HDEL', (client: Redis) => client.hdel(key, ...fields));
    }

    async hExists(key: string, field: string): Promise<boolean> {
        return this.commandWraper('HEXISTS', async (client: Redis) => {
            const result = await client.hexists(key, field);
            return result === 1;
        });
    }

    async hKeys(key: string): Promise<string[]> {
        return this.commandWraper('HKEYS', (client: Redis) => client.hkeys(key));
    }

    async hVals<T = string>(key: string): Promise<T[]> {
        return this.commandWraper('HVALS', async (client: Redis) => {
            const values = await client.hvals(key);
            return values.map((v) => RedisSerializer.deserialize<T>(v) as T);
        });
    }

    async hLen(key: string): Promise<number> {
        return this.commandWraper('HLEN', (client: Redis) => client.hlen(key));
    }

    async hIncrBy(
        key: string,
        field: string,
        increment: number,
    ): Promise<number> {
        return this.commandWraper('HINCRBY', (client: Redis) =>
            client.hincrby(key, field, increment),
        );
    }

    async hDecrBy(
        key: string,
        field: string,
        decrement: number,
    ): Promise<number> {
        return this.commandWraper('HDECRBY', (client: Redis) =>
            client.hincrby(key, field, decrement),
        );
    }

    async hScan(
        key: string,
        pattern: string,
        count = 100,
    ): Promise<HashScanResult> {
        return this.commandWraper('HSCAN', async (client: Redis) => {
            const data: Record<string, string> = {};
            let cursor = '0';
            do {
                const [nextCursor, results] = await client.hscan(
                    key,
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    count,
                );
                cursor = nextCursor;
                for (let i = 0; i < results.length; i += 2) {
                    data[results[i]] = results[i + 1];
                }
            } while (cursor !== '0');
            return { cursor, data };
        });
    }

    async lPush<T>(key: string, ...values: T[]): Promise<number> {
        return this.commandWraper('LPUSH', (client: Redis) =>
            client.lpush(key, ...values.map(RedisSerializer.serialize)),
        );
    }

    async rPush<T>(key: string, ...values: T[]): Promise<number> {
        return this.commandWraper('RPUSH', (client: Redis) =>
            client.rpush(key, ...values.map(RedisSerializer.serialize)),
        );
    }

    async lPop<T = string>(key: string): Promise<Nullable<T>> {
        return this.commandWraper('LPOP', async (client: Redis) => {
            const value = await client.lpop(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async rPop<T = string>(key: string): Promise<Nullable<T>> {
        return this.commandWraper('RPOP', async (client: Redis) => {
            const value = await client.rpop(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async bLPop<T = string>(
        timeout: number,
        ...keys: string[]
    ): Promise<[string, T] | null> {
        return this.commandWraper('BLPOP', async (client: Redis) => {
            const result = await client.blpop(...keys, timeout);
            if (!result) return null;
            return [result[0], RedisSerializer.deserialize<T>(result[1]) as T];
        });
    }

    async bRPop<T = string>(
        timeout: number,
        ...keys: string[]
    ): Promise<[string, T] | null> {
        return this.commandWraper('BRPOP', async (client: Redis) => {
            const result = await client.brpop(...keys, timeout);
            if (!result) return null;
            return [result[0], RedisSerializer.deserialize<T>(result[1]) as T];
        });
    }

    async lRange<T = string>(
        key: string,
        start: number,
        stop: number,
    ): Promise<T[]> {
        return this.commandWraper('LRANGE', async (client: Redis) => {
            const values = await client.lrange(key, start, stop);
            return values.map((v) => RedisSerializer.deserialize<T>(v) as T);
        });
    }

    async lIndex<T = string>(key: string, index: number): Promise<Nullable<T>> {
        return this.commandWraper('LINDEX', async (client: Redis) => {
            const value = await client.lindex(key, index);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async lTrim(key: string, start: number, stop: number): Promise<void> {
        return this.commandWraper('LTRIM', async (client: Redis) => {
            await client.ltrim(key, start, stop);
        });
    }

    async lRem<T>(key: string, count: number, value: T): Promise<number> {
        return this.commandWraper('LREM', (client: Redis) =>
            client.lrem(key, count, RedisSerializer.serialize(value)),
        );
    }

    async sAdd<T>(key: string, ...members: T[]): Promise<number> {
        return this.commandWraper('SADD', (client: Redis) =>
            client.sadd(key, ...members.map(RedisSerializer.serialize)),
        );
    }

    async sRem<T>(key: string, ...members: T[]): Promise<number> {
        return this.commandWraper('SREM', (client: Redis) =>
            client.srem(key, ...members.map(RedisSerializer.serialize)),
        );
    }

    async sIsMember<T>(key: string, member: T): Promise<boolean> {
        return this.commandWraper('SISMEMBER', async (client: Redis) => {
            const result = await client.sismember(
                key,
                RedisSerializer.serialize(member),
            );
            return result === 1;
        });
    }

    async sMembers<T = string>(key: string): Promise<T[]> {
        return this.commandWraper('SMEMBERS', async (client: Redis) => {
            const members = await client.smembers(key);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sCard(key: string): Promise<number> {
        return this.commandWraper('SCARD', (client: Redis) => client.scard(key));
    }

    async sUnion<T = string>(...keys: string[]): Promise<T[]> {
        return this.commandWraper('SUNION', async (client: Redis) => {
            const members = await client.sunion(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sInter<T = string>(...keys: string[]): Promise<T[]> {
        return this.commandWraper('SINTER', async (client: Redis) => {
            const members = await client.sinter(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sDiff<T = string>(...keys: string[]): Promise<T[]> {
        return this.commandWraper('SDIFF', async (client: Redis) => {
            const members = await client.sdiff(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sMove<T>(
        source: string,
        destination: string,
        member: T,
    ): Promise<boolean> {
        return this.commandWraper('SMOVE', async (client: Redis) => {
            const result = await client.smove(
                source,
                destination,
                RedisSerializer.serialize(member),
            );
            return result === 1;
        });
    }

    async sPop<T = string>(
        key: string,
        count?: number,
    ): Promise<T | T[] | null> {
        return this.commandWraper('SPOP', async (client: Redis) => {
            if (count !== undefined) {
                const members = await client.spop(key, count);
                return members.map(
                    (m) => RedisSerializer.deserialize<T>(m) as T,
                );
            }
            const member = await client.spop(key);
            return member
                ? (RedisSerializer.deserialize<T>(member) as T)
                : null;
        });
    }

    async zAdd(key: string, members: ZMember[]): Promise<number> {
        return this.commandWraper('ZADD', async (client: Redis) => {
            const args: (string | number)[] = [];
            for (const { score, member } of members) args.push(score, member);
            return client.zadd(key, ...args);
        });
    }

    async zScore(key: string, member: string): Promise<Nullable<number>> {
        return this.commandWraper('ZSCORE', async (client: Redis) => {
            const score = await client.zscore(key, member);
            return score !== null ? parseFloat(score) : null;
        });
    }

    async zRank(key: string, member: string): Promise<Nullable<number>> {
        return this.commandWraper('ZRANK', (client: Redis) => client.zrank(key, member));
    }

    async zRevRank(key: string, member: string): Promise<Nullable<number>> {
        return this.commandWraper('ZREVRANK', (client: Redis) =>
            client.zrevrank(key, member),
        );
    }

    async zRange(
        key: string,
        start: number,
        stop: number,
        options?: ZRangeOptions,
    ): Promise<string[] | ZMember[]> {
        return this.commandWraper('ZRANGE', async (client: Redis) => {
            if (options?.withScores) {
                const result = options.rev
                    ? await client.zrevrange(
                          key,
                          start,
                          stop,
                          'WITHSCORES',
                      )
                    : await client.zrange(key, start, stop, 'WITHSCORES');
                const members: ZMember[] = [];
                for (let i = 0; i < result.length; i += 2) {
                    members.push({
                        member: result[i],
                        score: parseFloat(result[i + 1]),
                    });
                }
                return members;
            }
            if (options?.rev) return client.zrevrange(key, start, stop);
            return client.zrange(key, start, stop);
        });
    }

    async zRangeByScore(
        key: string,
        min: number | string,
        max: number | string,
        withScores?: boolean,
        limit?: { offset: number; count: number },
    ): Promise<string[] | ZMember[]> {
        return this.commandWraper('ZRANGEBYSCORE', async (client: Redis) => {
            if (withScores) {
                const result = limit
                    ? await client.zrangebyscore(
                          key,
                          min,
                          max,
                          'WITHSCORES',
                          'LIMIT',
                          limit.offset,
                          limit.count,
                      )
                    : await client.zrangebyscore(
                          key,
                          min,
                          max,
                          'WITHSCORES',
                      );
                const members: ZMember[] = [];
                for (let i = 0; i < result.length; i += 2) {
                    members.push({
                        member: result[i],
                        score: parseFloat(result[i + 1]),
                    });
                }
                return members;
            }
            if (limit)
                return client.zrangebyscore(
                    key,
                    min,
                    max,
                    'LIMIT',
                    limit.offset,
                    limit.count,
                );
            return client.zrangebyscore(key, min, max);
        });
    }

    async zRem(key: string, ...members: string[]): Promise<number> {
        return this.commandWraper('ZREM', (client: Redis) =>
            client.zrem(key, ...members),
        );
    }

    async zRemRangeByRank(
        key: string,
        start: number,
        stop: number,
    ): Promise<number> {
        return this.commandWraper('ZREMRANGEBYRANK', (client: Redis) =>
            client.zremrangebyrank(key, start, stop),
        );
    }

    async zRemRangeByScore(
        key: string,
        min: number | string,
        max: number | string,
    ): Promise<number> {
        return this.commandWraper('ZREMRANGEBYSCORE', (client: Redis) =>
            client.zremrangebyscore(key, min, max),
        );
    }

    async zCard(key: string): Promise<number> {
        return this.commandWraper('ZCARD', (client: Redis) => client.zcard(key));
    }

    async zCount(
        key: string,
        min: number | string,
        max: number | string,
    ): Promise<number> {
        return this.commandWraper('ZCOUNT', (client: Redis) =>
            client.zcount(key, min, max),
        );
    }

    async zIncrBy(
        key: string,
        increment: number,
        member: string,
    ): Promise<string> {
        return this.commandWraper('ZINCRBY', (client: Redis) =>
            client.zincrby(key, increment, member),
        );
    }

    async publish<T>(channel: string, message: T): Promise<number> {
        return this.commandWraper('PUBLISH', (client: Redis) =>
            client.publish(channel, RedisSerializer.serialize(message)),
        );
    }

    // subscribe(
    //     channels: string[],
    //     onMessage: (channel: string, message: string) => void,
    // ): Redis {
    //     const subscriber = client.duplicate();
    //     subscriber.subscribe(...channels);
    //     subscriber.on('message', onMessage);
    //     return subscriber;
    // }

    async pipeline(
        fn: (pipe: ChainableCommander) => void | Promise<void>,
    ): Promise<RedisPipelineResult> {
        return this.commandWraper('PIPELINE', async (client: Redis) => {
            const pipe = client.pipeline();
            await fn(pipe);
            const results = await pipe.exec();
            const errors = (results ?? [])
                .filter(([err]) => err !== null)
                .map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }

    async transaction(
        fn: (pipe: ChainableCommander) => void | Promise<void>,
    ): Promise<RedisPipelineResult> {
        return this.commandWraper('MULTI/EXEC', async (client: Redis) => {
            const multi = client.multi();
            await fn(multi);
            const results = await multi.exec();
            const errors = (results ?? [])
                .filter(([err]) => err !== null)
                .map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }
}
