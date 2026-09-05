import Redis from 'ioredis';
import type { ChainableCommander } from 'ioredis';
import { RedisClient } from './redis.client';
import { RedisConfig } from './types/redis.types';
import type {
  CacheOptions,
  SetOptions,
  ScanOptions,
  ZRangeOptions,
  ZMember,
  HashScanResult,
  ScanResult,
  RedisPipelineResult,
  RedisInfo,
  LockOptions,
  RateLimitResult,
  Nullable,
} from './types/redis.types';
import { REDIS_CONSTANTS } from './constants/redis.constants';
import { RedisSerializer } from './utils/redis.serializer';
import { Logger, RedisLogger } from './utils/redis.logger';
import { withCommandError } from './decorators/retry.decorator';
import { RedisLockException } from './exceptions/redis.exception';

/**
 * RedisService — Industry-standard Redis wrapper over ioredis.
 *
 * Features:
 *  - Full ioredis API coverage (String, Hash, List, Set, Sorted Set, Pub/Sub)
 *  - Typed get/set with automatic JSON serialization
 *  - Custom methods: cache-aside, distributed lock, rate limiting, session management
 *  - Pipeline/transaction helpers
 *  - Scan-based key iteration (no KEYS in production)
 *  - Structured error hierarchy (RedisException subclasses)
 *  - Pluggable logger interface
 */
export class RedisService {
  private readonly redisClient: RedisClient;
  private readonly logger: Logger;

  constructor(config: RedisConfig, logger?: Logger) {
    this.logger = logger ?? new RedisLogger();
    this.redisClient = new RedisClient(config, this.logger);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  async connect(): Promise<void> { await this.redisClient.connect(); }
  async disconnect(): Promise<void> { await this.redisClient.disconnect(); }
  get isConnected(): boolean { return this.redisClient.connected; }

  /** Expose the raw ioredis client for advanced use cases. */
  getRawClient(): Redis { return this.client; }

  // ─── String Commands ─────────────────────────────────────────────────────────

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

  async get<T = string>(key: string): Promise<Nullable<T>> { 
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

  // ─── Key Commands ─────────────────────────────────────────────────────────────

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

  /**
   * Scan keys matching a pattern (production-safe alternative to KEYS).
   * Iterates the entire keyspace lazily using cursor-based scan.
   */
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

  // ─── Hash Commands ────────────────────────────────────────────────────────────

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

  // ─── List Commands ────────────────────────────────────────────────────────────

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

  async lLen(key: string): Promise<number> {
    return withCommandError('LLEN', () => this.client.llen(key));
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

  async lSet<T>(key: string, index: number, value: T): Promise<void> {
    return withCommandError('LSET', async () => {
      await this.client.lset(key, index, RedisSerializer.serialize(value));
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

  // ─── Set Commands ─────────────────────────────────────────────────────────────

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

  // ─── Sorted Set Commands ──────────────────────────────────────────────────────

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

  // ─── Pub/Sub ──────────────────────────────────────────────────────────────────

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

  // ─── Transaction / Pipeline ───────────────────────────────────────────────────

  /**
   * Execute a pipeline (batch commands, non-atomic, reduced RTT).
   */
  async pipeline(fn: (pipe: ChainableCommander) => void | Promise<void>): Promise<RedisPipelineResult> {
    return withCommandError('PIPELINE', async () => {
      const pipe = this.client.pipeline();
      await fn(pipe);
      const results = await pipe.exec();
      const errors = (results ?? []).filter(([err]) => err !== null).map(([err]) => err as Error);
      return { results: results ?? [], errors };
    });
  }

  /**
   * Execute a MULTI/EXEC transaction (atomic — all succeed or all fail).
   */
  async transaction(fn: (pipe: ChainableCommander) => void | Promise<void>): Promise<RedisPipelineResult> {
    return withCommandError('MULTI/EXEC', async () => {
      const multi = this.client.multi();
      await fn(multi);
      const results = await multi.exec();
      const errors = (results ?? []).filter(([err]) => err !== null).map(([err]) => err as Error);
      return { results: results ?? [], errors };
    });
  }

  // ─── Server Commands ──────────────────────────────────────────────────────────

  async ping(message?: string): Promise<string> {
    return withCommandError('PING', () =>
      message ? this.client.ping(message) : this.client.ping(),
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.ping();
      return response === REDIS_CONSTANTS.PING_RESPONSE;
    } catch { return false; }
  }

  async flushDb(): Promise<void> {
    return withCommandError('FLUSHDB', async () => { await this.client.flushdb(); });
  }

  async dbSize(): Promise<number> {
    return withCommandError('DBSIZE', () => this.client.dbsize());
  }

  async info(section?: string): Promise<RedisInfo> {
    return withCommandError('INFO', async () => {
      const raw = section
        ? await this.client.call('INFO', section) as string
        : await this.client.info();
      return this.parseInfo(raw);
    });
  }

  async time(): Promise<[string, string]> {
    return withCommandError('TIME', async () => {
      const result = await this.client.call('TIME') as string[];
      return [result[0], result[1]];
    });
  }

  async memoryUsage(key: string): Promise<Nullable<number>> {
    return withCommandError('MEMORY USAGE', () =>
      this.client.call('MEMORY', 'USAGE', key) as Promise<Nullable<number>>,
    );
  }

  // ─── ✦ Custom High-Level Methods ─────────────────────────────────────────────

  /**
   * Cache-aside pattern: return cached value or compute and cache it.
   * @example
   * const user = await redis.getOrSet('user:123', () => db.findUser(123), { ttl: 300 });
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug('Cache hit', { key });
      return cached;
    }
    this.logger.debug('Cache miss, computing value', { key });
    const value = await factory();
    const setOptions: SetOptions = {};
    if (options.ttl) setOptions.ex = options.ttl;
    if (options.nx) setOptions.nx = true;
    await this.set(key, value, setOptions);
    return value;
  }

  /**
   * Invalidate all keys matching a pattern (uses SCAN, not KEYS).
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const keys = await this.scan(pattern);
    if (keys.length === 0) return 0;
    return this.del(...keys);
  }

  /**
   * Acquire a distributed lock using SET NX EX.
   * Returns a lock token — keep it to release safely.
   * @example
   * const token = await redis.acquireLock('job:123', { ttl: 30 });
   * try { ... } finally { await redis.releaseLock('job:123', token); }
   */
  async acquireLock(key: string, options: LockOptions = { ttl: REDIS_CONSTANTS.DEFAULT_LOCK_TTL }): Promise<string> {
    const lockKey = `${REDIS_CONSTANTS.LOCK_PREFIX}${key}`;
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const retryCount = options.retryCount ?? REDIS_CONSTANTS.DEFAULT_LOCK_RETRY_COUNT;
    const retryDelay = options.retryDelay ?? REDIS_CONSTANTS.DEFAULT_LOCK_RETRY_DELAY;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      const acquired = await this.setNX(lockKey, token, options.ttl);
      if (acquired) {
        this.logger.debug('Lock acquired', { key: lockKey, token });
        return token;
      }
      if (attempt < retryCount) {
        await new Promise((r) => setTimeout(r, retryDelay));
      }
    }
    throw new RedisLockException(lockKey, 'acquire');
  }

  /**
   * Release a distributed lock — only if the token matches (atomic Lua script).
   */
  async releaseLock(key: string, token: string): Promise<boolean> {
    const lockKey = `${REDIS_CONSTANTS.LOCK_PREFIX}${key}`;
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    try {
      const result = await this.client.eval(script, 1, lockKey, token) as number;
      const released = result === 1;
      this.logger.debug(released ? 'Lock released' : 'Lock token mismatch', { key: lockKey });
      return released;
    } catch (err) {
      throw new RedisLockException(lockKey, 'release', err as Error);
    }
  }

  /**
   * Execute a function while holding a distributed lock.
   * Lock is automatically released even if the function throws.
   * @example
   * await redis.withLock('invoice:42', async () => { ... }, { ttl: 10 });
   */
  async withLock<T>(key: string, fn: () => Promise<T>, options?: LockOptions): Promise<T> {
    const token = await this.acquireLock(key, options);
    try {
      return await fn();
    } finally {
      await this.releaseLock(key, token);
    }
  }

  /**
   * Fixed window rate limiter.
   * @example
   * const result = await redis.rateLimit('api:user:42', 100, 60); // 100 req/min
   * if (!result.allowed) throw new TooManyRequestsError();
   */
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const rlKey = `${REDIS_CONSTANTS.RATE_LIMIT_PREFIX}${key}`;
    const script = `
      local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[2])
      end
      return {current, redis.call("TTL", KEYS[1])}
    `;
    const result = await this.client.eval(script, 1, rlKey, limit, windowSeconds) as [number, number];
    const [current, ttl] = result;
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetAt: Math.floor(Date.now() / 1000) + ttl,
      total: limit,
    };
  }

  /**
   * Sliding window rate limiter (more accurate than fixed window).
   */
  async slidingWindowRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const rlKey = `${REDIS_CONSTANTS.RATE_LIMIT_PREFIX}sw:${key}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const script = `
      redis.call("ZREMRANGEBYSCORE", KEYS[1], "-inf", ARGV[1])
      local count = redis.call("ZCARD", KEYS[1])
      if count < tonumber(ARGV[3]) then
        redis.call("ZADD", KEYS[1], ARGV[2], ARGV[2])
        count = count + 1
      end
      redis.call("PEXPIRE", KEYS[1], ARGV[4])
      return count
    `;
    const count = await this.client.eval(script, 1, rlKey, windowStart, now, limit, windowMs) as number;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Math.floor((now + windowMs) / 1000),
      total: limit,
    };
  }

  /** Store a session object with TTL. */
  async setSession<T extends Record<string, unknown>>(sessionId: string, data: T, ttlSeconds = REDIS_CONSTANTS.DEFAULT_SESSION_TTL): Promise<void> {
    await this.set(`${REDIS_CONSTANTS.SESSION_PREFIX}${sessionId}`, data, { ex: ttlSeconds });
  }

  /** Retrieve a session object. */
  async getSession<T extends Record<string, unknown>>(sessionId: string): Promise<Nullable<T>> {
    return this.get<T>(`${REDIS_CONSTANTS.SESSION_PREFIX}${sessionId}`);
  }

  /** Delete a session. */
  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`${REDIS_CONSTANTS.SESSION_PREFIX}${sessionId}`);
  }

  /** Refresh a session TTL without modifying data. */
  async touchSession(sessionId: string, ttlSeconds = REDIS_CONSTANTS.DEFAULT_SESSION_TTL): Promise<boolean> {
    return this.expire(`${REDIS_CONSTANTS.SESSION_PREFIX}${sessionId}`, ttlSeconds);
  }

  /**
   * Push to a capped list (fixed max length — useful for activity feeds).
   */
  async pushCapped<T>(key: string, value: T, maxLen: number): Promise<void> {
    await this.pipeline((pipe) => {
      pipe.lpush(key, RedisSerializer.serialize(value));
      pipe.ltrim(key, 0, maxLen - 1);
    });
  }

  /** Get the full list as typed items. */
  async getList<T = string>(key: string): Promise<T[]> {
    return this.lRange<T>(key, 0, -1);
  }

  /** Bulk-get multiple keys in a single pipeline round-trip. */
  async bulkGet<T = string>(keys: string[]): Promise<Array<Nullable<T>>> {
    const result = await this.pipeline((pipe) => {
      for (const key of keys) pipe.get(key);
    });
    return result.results.map(([, val]) => RedisSerializer.deserialize<T>(val as string | null));
  }

  /** Set a hash to an object and reset its TTL atomically. */
  async setHashWithTtl(key: string, data: Record<string, unknown>, ttlSeconds: number): Promise<void> {
    await this.pipeline((pipe) => {
      pipe.hset(key, ...RedisSerializer.serializeHash(data));
      pipe.expire(key, ttlSeconds);
    });
  }

  /** Leaderboard: add/update a score and return new rank. */
  async leaderboardUpdate(boardKey: string, member: string, score: number): Promise<{ rank: number; score: number }> {
    await this.zAdd(boardKey, [{ member, score }]);
    const rank = await this.zRevRank(boardKey, member);
    return { rank: (rank ?? 0) + 1, score };
  }

  /** Get the top N entries from a leaderboard. */
  async leaderboardTop(boardKey: string, topN: number): Promise<ZMember[]> {
    return this.zRange(boardKey, 0, topN - 1, { rev: true, withScores: true }) as Promise<ZMember[]>;
  }

  /** Enqueue a job into a list-based FIFO queue. */
  async enqueue<T>(queueKey: string, job: T): Promise<void> {
    await this.rPush(`${REDIS_CONSTANTS.QUEUE_PREFIX}${queueKey}`, job);
  }

  /** Dequeue a job from a list-based FIFO queue. */
  async dequeue<T = string>(queueKey: string): Promise<Nullable<T>> {
    return this.lPop<T>(`${REDIS_CONSTANTS.QUEUE_PREFIX}${queueKey}`);
  }

  /** Blocking dequeue — waits for a job to become available. */
  async blockingDequeue<T = string>(queueKey: string, timeoutSeconds = 0): Promise<Nullable<T>> {
    const result = await this.bLPop<T>(timeoutSeconds, `${REDIS_CONSTANTS.QUEUE_PREFIX}${queueKey}`);
    return result ? result[1] : null;
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private get client(): Redis {
    return this.redisClient.getClient;
  }

  private parseInfo(raw: string): RedisInfo {
    const sections: RedisInfo = {
      server: {}, clients: {}, memory: {}, stats: {},
      replication: {}, cpu: {}, keyspace: {},
    };
    let currentSection = 'server';
    for (const line of raw.split('\r\n')) {
      if (line.startsWith('#')) {
        currentSection = line.replace('# ', '').toLowerCase();
      } else if (line.includes(':')) {
        const colonIdx = line.indexOf(':');
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim();
        const section = sections[currentSection as keyof RedisInfo];
        if (section) section[key] = value;
      }
    }
    return sections;
  }
}