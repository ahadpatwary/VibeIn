import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';

import Redis, { ChainableCommander } from 'ioredis';

import { HashScanResult, Nullable, RedisPipelineResult, ScanOptions, ScanResult, SetOptions, ZMember, ZRangeOptions, type RedisConfig } from './types/redis.types';
import { type RedisClient } from './redis.client';
import { Retry, withCommandError } from './decorators/retry.decorator';
import { RedisSerializer } from './utils/redis.serializer';
import { REDIS_CONSTANTS } from './constants/redis.constants';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {

    constructor(
        private readonly redisClient: RedisClient,
    ) {}

    async onModuleInit() {

        if(this.redisClient.connected) return this.redisClient.getClient;

        this.redisClient.connect();

    }

    async onModuleDestroy() {

        if(!this.redisClient.connected) return;

        this.redisClient.disconnect();
    }

    get connected(): boolean {
        return this.redisClient.connected;
    }

    private get client(): Redis {
        return this.redisClient.getClient;
    }

    async set<T>(key: string, value: T, options?: SetOptions): Promise<'OK' | null> {
        return withCommandError('SET', async () => {
            const serialized = RedisSerializer.serialize(value);

            if (!options || Object.keys(options).length === 0) {
                return this.client.set(key, serialized);
            }

            const args: (string | number)[] = [];

            if (options.ex !== undefined) args.push('EX', options.ex);
            else if (options.px !== undefined) args.push('PX', options.px);
            else if (options.exat !== undefined) args.push('EXAT', options.exat);
            else if (options.pxat !== undefined) args.push('PXAT', options.pxat);
            else if (options.keepttl) args.push('KEEPTTL');
            if (options.nx) args.push('NX');
            else if (options.xx) args.push('XX');

            return this.client.call('SET', key, serialized, ...args) as Promise<'OK' | null>;
        });
    }

    async get<T = string>(key: string): Promise<Nullable<T>> { //Nullable<T> = null | T
        return withCommandError('GET', async () => {
            const value = await this.client.get(key);
            return RedisSerializer.deserialize<T>(value);
        });
    } 

    async getRaw(key: string): Promise<Nullable<string>> {
        return withCommandError('GET', () => this.client.get(key));
    }

    async setNX<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
        return withCommandError('SETNX', async () => {
            const serialized = RedisSerializer.serialize(value);
            if (ttlSeconds !== undefined) {
                const result = await this.client.set(key, serialized, 'EX', ttlSeconds, 'NX');
                return result === 'OK';
            }
            const result = await this.client.setnx(key, serialized);
            return result === 1;
        });
    }

    async mSet(pairs: Record<string, unknown>): Promise<void> {
        return withCommandError('MSET', async () => {
            const args: string[] = [];
            for (const [key, value] of Object.entries(pairs)) {
            args.push(key, RedisSerializer.serialize(value));
            }
            await this.client.mset(...args);
        });
    }

    async mGet<T = string>(keys: string[]): Promise<Array<Nullable<T>>> {
        return withCommandError('MGET', async () => {
            const values = await this.client.mget(...keys);
            return values.map((v) => RedisSerializer.deserialize<T>(v));
        });
    }

    async incr(key: string): Promise<number> {
        return withCommandError('INCR', () => this.client.incr(key));
    }

    async incrBy(key: string, increment: number): Promise<number> {
        return withCommandError('INCRBY', () => this.client.incrby(key, increment));
    }

    async incrByFloat(key: string, increment: number): Promise<string> {
        return withCommandError('INCRBYFLOAT', () => this.client.incrbyfloat(key, increment));
    }

    async decr(key: string): Promise<number> {
        return withCommandError('DECR', () => this.client.decr(key));
    }

    async decrBy(key: string, decrement: number): Promise<number> {
        return withCommandError('DECRBY', () => this.client.decrby(key, decrement));
    }

    async append(key: string, value: string): Promise<number> {
        return withCommandError('APPEND', () => this.client.append(key, value));
    }

    async strlen(key: string): Promise<number> {
        return withCommandError('STRLEN', () => this.client.strlen(key));
    }

    async getDel<T = string>(key: string): Promise<Nullable<T>> {
        return withCommandError('GETDEL', async () => {
            const value = await this.client.getdel(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async getSet<T = string>(key: string, newValue: T): Promise<Nullable<T>> {
        return withCommandError('GETSET', async () => {
            const value = await this.client.getset(key, RedisSerializer.serialize(newValue));
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async del(...keys: string[]): Promise<number> {
        return withCommandError('DEL', () => this.client.del(...keys));
    }

    async exists(...keys: string[]): Promise<number> {
        return withCommandError('EXISTS', () => this.client.exists(...keys));
    }

    async hasKey(key: string): Promise<boolean> {
        return withCommandError('EXISTS', async () => {
            const count = await this.client.exists(key);
            return count > 0;
        });
    }
    
    @Retry()
    async expire(key: string, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT'): Promise<boolean> {
        return withCommandError('EXPIRE', async () => {
            const result = mode
                ? await this.client.call('EXPIRE', key, seconds, mode) as number
                : await this.client.expire(key, seconds);
            return result === 1;
        });
    }

    async pExpire(key: string, milliseconds: number): Promise<boolean> {
        return withCommandError('PEXPIRE', async () => {
            const result = await this.client.pexpire(key, milliseconds);
            return result === 1;
        });
    }

    async expireAt(key: string, timestamp: number): Promise<boolean> {
        return withCommandError('EXPIREAT', async () => {
            const result = await this.client.expireat(key, timestamp);
            return result === 1;
        });
    }

    async persist(key: string): Promise<boolean> {
        return withCommandError('PERSIST', async () => {
            const result = await this.client.persist(key);
            return result === 1;
        });
    }

    async ttl(key: string): Promise<number> {
        return withCommandError('TTL', () => this.client.ttl(key));
    }

    async pTtl(key: string): Promise<number> {
        return withCommandError('PTTL', () => this.client.pttl(key));
    }

    async rename(key: string, newKey: string): Promise<void> {
        return withCommandError('RENAME', async () => { await this.client.rename(key, newKey); });
    }

    async renameNX(key: string, newKey: string): Promise<boolean> {
        return withCommandError('RENAMENX', async () => {
            const result = await this.client.renamenx(key, newKey);
            return result === 1;
        });
    }

    async type(key: string): Promise<string> {
        return withCommandError('TYPE', () => this.client.type(key));
    }

    async randomKey(): Promise<Nullable<string>> {
        return withCommandError('RANDOMKEY', () => this.client.randomkey());
    }

    async copy(source: string, destination: string, replace?: boolean): Promise<boolean> {
        return withCommandError('COPY', async () => {
            const args: (string | number)[] = replace ? ['REPLACE'] : [];
            const result = await this.client.call('COPY', source, destination, ...args) as number;
            return result === 1;
        });
    }

    async scan(pattern: string, options?: ScanOptions): Promise<string[]> {
        return withCommandError('SCAN', async () => {
            const allKeys: string[] = [];
            let cursor = '0';
        
            do {
                const args: (string | number)[] = [cursor, 'MATCH', options?.match ?? pattern, 'COUNT', options?.count ?? REDIS_CONSTANTS.SCAN_DEFAULT_COUNT];
                if (options?.type) args.push('TYPE', options.type);
        
                const result = await this.client.call('SCAN', ...args) as [string, string[]];
                cursor = result[0];
                allKeys.push(...result[1]);
            } while (cursor !== '0');
        
            return allKeys;
        });
    }
    
    async scanBatch(cursor: string, pattern: string, count = REDIS_CONSTANTS.SCAN_DEFAULT_COUNT): Promise<ScanResult> {
        return withCommandError('SCAN', async () => {
            const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
            return { cursor: nextCursor, keys };
        });
    }

    async hSet(key: string, field: string, value: unknown): Promise<number> {
        return withCommandError('HSET', () =>
            this.client.hset(key, field, RedisSerializer.serialize(value)),
        );
    }

    async hMSet(key: string, data: Record<string, unknown>): Promise<void> {
        return withCommandError('HMSET', async () => {
            const serialized = RedisSerializer.serializeHash(data);
            await this.client.hset(key, ...serialized);
        });
    }

    async hGet<T = string>(key: string, field: string): Promise<Nullable<T>> {
        return withCommandError('HGET', async () => {
            const value = await this.client.hget(key, field);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async hMGet<T = string>(key: string, ...fields: string[]): Promise<Array<Nullable<T>>> {
        return withCommandError('HMGET', async () => {
            const values = await this.client.hmget(key, ...fields);
            return values.map((v) => RedisSerializer.deserialize<T>(v));
        });
    }

    async hGetAll<T extends Record<string, unknown>>(key: string): Promise<T> {
        return withCommandError('HGETALL', async () => {
            const data = await this.client.hgetall(key);
            return RedisSerializer.deserializeHash<T>(data ?? {});
        });
    }

    async hDel(key: string, ...fields: string[]): Promise<number> {
        return withCommandError('HDEL', () => this.client.hdel(key, ...fields));
    }

    async hExists(key: string, field: string): Promise<boolean> {
        return withCommandError('HEXISTS', async () => {
            const result = await this.client.hexists(key, field);
            return result === 1;
        });
    }

    async hKeys(key: string): Promise<string[]> {
        return withCommandError('HKEYS', () => this.client.hkeys(key));
    }

    async hVals<T = string>(key: string): Promise<T[]> {
        return withCommandError('HVALS', async () => {
            const values = await this.client.hvals(key);
            return values.map((v) => RedisSerializer.deserialize<T>(v) as T);
        });
    }

    async hLen(key: string): Promise<number> {
        return withCommandError('HLEN', () => this.client.hlen(key));
    }

    async hIncrBy(key: string, field: string, increment: number): Promise<number> {
        return withCommandError('HINCRBY', () => this.client.hincrby(key, field, increment));
    }

    async hDecrBy(key: string, field: string, decrement: number): Promise<number> {
        return withCommandError('HDECRBY', () => this.client.hincrby(key, field, decrement))
    }

    async hScan(key: string, pattern: string, count = 100): Promise<HashScanResult> {
        return withCommandError('HSCAN', async () => {
            const data: Record<string, string> = {};
            let cursor = '0';
            do {
                const [nextCursor, results] = await this.client.hscan(key, cursor, 'MATCH', pattern, 'COUNT', count);
                cursor = nextCursor;
                for (let i = 0; i < results.length; i += 2) {
                    data[results[i]] = results[i + 1];
                }
            } while (cursor !== '0');
            return { cursor, data };
        });
    }

    async lPush<T>(key: string, ...values: T[]): Promise<number> {
        return withCommandError('LPUSH', () =>
            this.client.lpush(key, ...values.map(RedisSerializer.serialize)),
        );
    }

    async rPush<T>(key: string, ...values: T[]): Promise<number> {
        return withCommandError('RPUSH', () =>
            this.client.rpush(key, ...values.map(RedisSerializer.serialize)),
        );
    }

    async lPop<T = string>(key: string): Promise<Nullable<T>> {
        return withCommandError('LPOP', async () => {
            const value = await this.client.lpop(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async rPop<T = string>(key: string): Promise<Nullable<T>> {
        return withCommandError('RPOP', async () => {
            const value = await this.client.rpop(key);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async bLPop<T = string>(timeout: number, ...keys: string[]): Promise<[string, T] | null> {
        return withCommandError('BLPOP', async () => {
            const result = await this.client.blpop(...keys, timeout);
            if (!result) return null;
            return [result[0], RedisSerializer.deserialize<T>(result[1]) as T];
        });
    }

    async bRPop<T = string>(timeout: number, ...keys: string[]): Promise<[string, T] | null> {
        return withCommandError('BRPOP', async () => {
            const result = await this.client.brpop(...keys, timeout);
            if (!result) return null;
            return [result[0], RedisSerializer.deserialize<T>(result[1]) as T];
        });
    }

    async lRange<T = string>(key: string, start: number, stop: number): Promise<T[]> {
        return withCommandError('LRANGE', async () => {
            const values = await this.client.lrange(key, start, stop);
            return values.map((v) => RedisSerializer.deserialize<T>(v) as T);
        });
    }

    async lIndex<T = string>(key: string, index: number): Promise<Nullable<T>> {
        return withCommandError('LINDEX', async () => {
            const value = await this.client.lindex(key, index);
            return RedisSerializer.deserialize<T>(value);
        });
    }

    async lTrim(key: string, start: number, stop: number): Promise<void> {
        return withCommandError('LTRIM', async () => { await this.client.ltrim(key, start, stop); });
    }

    async lRem<T>(key: string, count: number, value: T): Promise<number> {
        return withCommandError('LREM', () =>
            this.client.lrem(key, count, RedisSerializer.serialize(value)),
        );
    }

    async sAdd<T>(key: string, ...members: T[]): Promise<number> {
        return withCommandError('SADD', () =>
            this.client.sadd(key, ...members.map(RedisSerializer.serialize)),
        );
    }

    async sRem<T>(key: string, ...members: T[]): Promise<number> {
        return withCommandError('SREM', () =>
            this.client.srem(key, ...members.map(RedisSerializer.serialize)),
        );
    }

    async sIsMember<T>(key: string, member: T): Promise<boolean> {
        return withCommandError('SISMEMBER', async () => {
            const result = await this.client.sismember(key, RedisSerializer.serialize(member));
            return result === 1;
        });
    }

    async sMembers<T = string>(key: string): Promise<T[]> {
        return withCommandError('SMEMBERS', async () => {
            const members = await this.client.smembers(key);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sCard(key: string): Promise<number> {
        return withCommandError('SCARD', () => this.client.scard(key));
    }

    async sUnion<T = string>(...keys: string[]): Promise<T[]> {
        return withCommandError('SUNION', async () => {
            const members = await this.client.sunion(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }

    async sInter<T = string>(...keys: string[]): Promise<T[]> {
        return withCommandError('SINTER', async () => {
            const members = await this.client.sinter(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }
    
    async sDiff<T = string>(...keys: string[]): Promise<T[]> {
        return withCommandError('SDIFF', async () => {
            const members = await this.client.sdiff(...keys);
            return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
        });
    }
    
    async sMove<T>(source: string, destination: string, member: T): Promise<boolean> {
        return withCommandError('SMOVE', async () => {
            const result = await this.client.smove(source, destination, RedisSerializer.serialize(member));
            return result === 1;
        });
    }
    
    async sPop<T = string>(key: string, count?: number): Promise<T | T[] | null> {
        return withCommandError('SPOP', async () => {
            if (count !== undefined) {
                const members = await this.client.spop(key, count);
                return members.map((m) => RedisSerializer.deserialize<T>(m) as T);
            }
            const member = await this.client.spop(key);
            return member ? (RedisSerializer.deserialize<T>(member) as T) : null;
        });
    }

    async zAdd(key: string, members: ZMember[]): Promise<number> {
        return withCommandError('ZADD', async () => {
            const args: (string | number)[] = [];
            for (const { score, member } of members) args.push(score, member);
            return this.client.zadd(key, ...args);
        });
    }

    async zScore(key: string, member: string): Promise<Nullable<number>> {
        return withCommandError('ZSCORE', async () => {
            const score = await this.client.zscore(key, member);
            return score !== null ? parseFloat(score) : null;
        });
    }

    async zRank(key: string, member: string): Promise<Nullable<number>> {
        return withCommandError('ZRANK', () => this.client.zrank(key, member));
    }

    async zRevRank(key: string, member: string): Promise<Nullable<number>> {
        return withCommandError('ZREVRANK', () => this.client.zrevrank(key, member));
    }
    
    async zRange(key: string, start: number, stop: number, options?: ZRangeOptions): Promise<string[] | ZMember[]> {
        return withCommandError('ZRANGE', async () => {
            if (options?.withScores) {
                const result = options.rev
                    ? await this.client.zrevrange(key, start, stop, 'WITHSCORES')
                    : await this.client.zrange(key, start, stop, 'WITHSCORES');
                const members: ZMember[] = [];
                for (let i = 0; i < result.length; i += 2) {
                    members.push({ member: result[i], score: parseFloat(result[i + 1]) });
                }
                return members;
            }
            if (options?.rev) return this.client.zrevrange(key, start, stop);
            return this.client.zrange(key, start, stop);
        });
    }
    
    async zRangeByScore(key: string, min: number | string, max: number | string, withScores?: boolean, limit?: { offset: number; count: number }): Promise<string[] | ZMember[]> {
        return withCommandError('ZRANGEBYSCORE', async () => {
            if (withScores) {
                const result = limit
                    ? await this.client.zrangebyscore(key, min, max, 'WITHSCORES', 'LIMIT', limit.offset, limit.count)
                    : await this.client.zrangebyscore(key, min, max, 'WITHSCORES');
                const members: ZMember[] = [];
                for (let i = 0; i < result.length; i += 2) {
                    members.push({ member: result[i], score: parseFloat(result[i + 1]) });
                }
                return members;
            }
            if (limit) return this.client.zrangebyscore(key, min, max, 'LIMIT', limit.offset, limit.count);
            return this.client.zrangebyscore(key, min, max);
        });
    }
    
    async zRem(key: string, ...members: string[]): Promise<number> {
        return withCommandError('ZREM', () => this.client.zrem(key, ...members));
    }
    
    async zRemRangeByRank(key: string, start: number, stop: number): Promise<number> {
        return withCommandError('ZREMRANGEBYRANK', () => this.client.zremrangebyrank(key, start, stop));
    }
    
    async zRemRangeByScore(key: string, min: number | string, max: number | string): Promise<number> {
        return withCommandError('ZREMRANGEBYSCORE', () => this.client.zremrangebyscore(key, min, max));
    }
    
    async zCard(key: string): Promise<number> {
        return withCommandError('ZCARD', () => this.client.zcard(key));
    }
    
    async zCount(key: string, min: number | string, max: number | string): Promise<number> {
        return withCommandError('ZCOUNT', () => this.client.zcount(key, min, max));
    }
    
    async zIncrBy(key: string, increment: number, member: string): Promise<string> {
        return withCommandError('ZINCRBY', () => this.client.zincrby(key, increment, member));
    }

    async publish<T>(channel: string, message: T): Promise<number> {
        return withCommandError('PUBLISH', () =>
            this.client.publish(channel, RedisSerializer.serialize(message)),
        );
    }

    subscribe(channels: string[], onMessage: (channel: string, message: string) => void): Redis {
        const subscriber = this.client.duplicate();
        subscriber.subscribe(...channels);
        subscriber.on('message', onMessage);
        return subscriber;
    }

    async pipeline(fn: (pipe: ChainableCommander) => void | Promise<void>): Promise<RedisPipelineResult> {
        return withCommandError('PIPELINE', async () => {
            const pipe = this.client.pipeline();
            await fn(pipe);
            const results = await pipe.exec();
            const errors = (results ?? []).filter(([err]) => err !== null).map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }

    async transaction(fn: (pipe: ChainableCommander) => void | Promise<void>): Promise<RedisPipelineResult> {
        return withCommandError('MULTI/EXEC', async () => {
            const multi = this.client.multi();
            await fn(multi);
            const results = await multi.exec();
            const errors = (results ?? []).filter(([err]) => err !== null).map(([err]) => err as Error);
            return { results: results ?? [], errors };
        });
    }
    
}