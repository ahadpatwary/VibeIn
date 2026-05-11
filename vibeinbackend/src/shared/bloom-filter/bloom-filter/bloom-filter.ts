import type { Redis } from 'ioredis';
import { getHashPositions } from '../hash';

// ─────────────────────────────────────────────────────────────────
//  Lua Scripts (atomic Redis operations — no race conditions)
// ─────────────────────────────────────────────────────────────────

/**
 * Atomically SET k bits and return the number that were ALREADY set.
 * KEYS[1] = bitfield key
 * ARGV[1..k] = bit positions
 */
const LUA_ADD = `
local key = KEYS[1]
local already = 0
for i = 1, #ARGV do
  local prev = redis.call('GETBIT', key, ARGV[i])
  if prev == 1 then already = already + 1 end
  redis.call('SETBIT', key, ARGV[i], 1)
end
return already
`;

/**
 * Check if ALL k bits are set (element membership test).
 * Returns 1 if all set (probably present), 0 if any unset (definitely absent).
 * KEYS[1] = bitfield key
 * ARGV[1..k] = bit positions
 */
const LUA_HAS = `
local key = KEYS[1]
for i = 1, #ARGV do
  if redis.call('GETBIT', key, ARGV[i]) == 0 then
    return 0
  end
end
return 1
`;

/**
 * Counting Bloom Filter — atomically increment k counters.
 * Uses a separate HASH key for counts.
 * KEYS[1] = counter hash key
 * ARGV[1..k] = counter field names (bit positions as strings)
 */
const LUA_COUNT_ADD = `
local key = KEYS[1]
for i = 1, #ARGV do
  redis.call('HINCRBY', key, ARGV[i], 1)
end
return 1
`;

/**
 * Counting Bloom Filter — decrement counters, clear bit if count reaches 0.
 * KEYS[1] = bitfield key, KEYS[2] = counter hash key
 * ARGV[1..k] = positions
 */
const LUA_COUNT_REMOVE = `
local bitKey   = KEYS[1]
local countKey = KEYS[2]
for i = 1, #ARGV do
  local pos   = ARGV[i]
  local count = tonumber(redis.call('HINCRBY', countKey, pos, -1))
  if count <= 0 then
    redis.call('HSET', countKey, pos, 0)
    redis.call('SETBIT', bitKey, pos, 0)
  end
end
return 1
`;

function optimalBitSize(n: number, p: number): number {
  return Math.ceil(-n * Math.log(p) / Math.LN2 ** 2);
}

function optimalHashCount(m: number, n: number): number {
  return Math.max(1, Math.round((m / n) * Math.LN2));
}

function estimateFPR(k: number, n: number, m: number): number {
  return (1 - Math.exp(-k * n / m)) ** k;
}

export interface BloomFilterOptions {
  key?: string;
  capacity?: number;
  errorRate?: number;
  counting?: boolean;
  ttl?: number | null;
}

export interface BloomFilterStats {
  key: string;
  capacity: number;
  targetErrorRate: number;
  estimatedCount: number;
  currentFPR: number;
  currentFPRPct: string;
  bitArraySize: number;
  hashFunctions: number;
  setBits: number;
  fillRatio: number;
  fillRatioPct: string;
  counting: boolean;
  healthy: boolean;
  createdAt: string | null;
}

export class BloomFilter {
  private readonly _redis: Redis;
  private readonly _key: string;
  private readonly _capacity: number;
  private readonly _errorRate: number;
  private readonly _counting: boolean;
  private readonly _ttl: number | null;
  private readonly _m: number;
  private readonly _k: number;
  private readonly _bitKey: string;
  private readonly _countKey: string;
  private readonly _metaKey: string;
  private _shaAdd: string | null;
  private _shaHas: string | null;
  private _shaCountAdd: string | null;
  private _shaCountRemove: string | null;

  constructor(redis: Redis, options: BloomFilterOptions = {}) {
    if (!redis) throw new Error('BloomFilter: redis client is required');

    this._redis = redis;
    this._key = options.key ?? 'bf:default';
    this._capacity = options.capacity ?? 100_000;
    this._errorRate = options.errorRate ?? 0.01;
    this._counting = options.counting ?? false;
    this._ttl = options.ttl ?? null;

    if (this._errorRate <= 0 || this._errorRate >= 1) {
      throw new Error('BloomFilter: errorRate must be between 0 and 1 (exclusive)');
    }
    if (this._capacity < 1) {
      throw new Error('BloomFilter: capacity must be >= 1');
    }

    this._m = optimalBitSize(this._capacity, this._errorRate);
    this._k = optimalHashCount(this._m, this._capacity);

    this._bitKey = `${this._key}:bits`;
    this._countKey = `${this._key}:counts`;
    this._metaKey = `${this._key}:meta`;

    this._shaAdd = null;
    this._shaHas = null;
    this._shaCountAdd = null;
    this._shaCountRemove = null;
  }

  async init(): Promise<this> {
    [
      this._shaAdd,
      this._shaHas,
      this._shaCountAdd,
      this._shaCountRemove,
    ] = await Promise.all([
      this._redis.script('LOAD', LUA_ADD),
      this._redis.script('LOAD', LUA_HAS),
      this._redis.script('LOAD', LUA_COUNT_ADD),
      this._redis.script('LOAD', LUA_COUNT_REMOVE),
    ]) as string[];

    await this._redis.hset(
      this._metaKey,
      'capacity', this._capacity,
      'errorRate', this._errorRate,
      'bitSize', this._m,
      'hashCount', this._k,
      'counting', this._counting ? '1' : '0',
      'createdAt', Date.now(),
    );

    if (this._ttl) {
      await this._redis.expire(this._metaKey, this._ttl);
    }

    return this;
  }

  async add(item: string): Promise<boolean> {
    const positions = this._getPositions(item);
    const posArgs = positions.map(String);

    const alreadySet = await this._evalsha(
      this._shaAdd,
      LUA_ADD,
      [this._bitKey],
      posArgs,
    );

    if (this._counting) {
      await this._evalsha(
        this._shaCountAdd,
        LUA_COUNT_ADD,
        [this._countKey],
        posArgs,
      );
    }

    if (this._ttl) {
      await this._redis.expire(this._bitKey, this._ttl);
      if (this._counting) {
        await this._redis.expire(this._countKey, this._ttl);
      }
    }

    await this._redis.hincrby(this._metaKey, 'count', 1);
    return alreadySet < this._k;
  }

  async addMany(items: string[]): Promise<boolean[]> {
    if (!items?.length) return [];

    const results: boolean[] = [];
    const pipeline = this._redis.pipeline();

    for (const item of items) {
      const posArgs = this._getPositions(item).map(String);
      pipeline.evalsha(this._shaAdd as string, 1, this._bitKey, ...posArgs);
      if (this._counting) {
        pipeline.evalsha(this._shaCountAdd as string, 1, this._countKey, ...posArgs);
      }
    }

    const responses = await pipeline.exec();
    const step = this._counting ? 2 : 1;
    if(!responses) return [];

    for (let i = 0; i < responses.length; i += step) {
      const [err, alreadySet] = responses?.[i] as [Error | null, number];
      if (err) throw err;
      results.push(alreadySet < this._k);
    }

    await this._redis.hincrby(this._metaKey, 'count', items.length);
    return results;
  }

  async has(item: string): Promise<boolean> {
    const posArgs = this._getPositions(item).map(String);
    const result = await this._evalsha(
      this._shaHas as string,
      LUA_HAS,
      [this._bitKey],
      posArgs,
    );
    return result === 1;
  }

  async hasMany(items: string[]): Promise<boolean[]> {
    if (!items?.length) return [];

    const pipeline = this._redis.pipeline();
    for (const item of items) {
      const posArgs = this._getPositions(item).map(String);
      pipeline.evalsha(this._shaHas as string, 1, this._bitKey, ...posArgs);
    }

    const responses = await pipeline.exec();
    if(!responses) return [];

    return responses.map(([err, val]) => {
      if (err) throw err;
      return val === 1;
    });
  }

  async remove(item: string): Promise<void> {
    if (!this._counting) {
      throw new Error(
        'BloomFilter: remove() requires counting mode. ' +
        'Initialize with { counting: true }',
      );
    }

    const posArgs = this._getPositions(item).map(String);
    await this._evalsha(
      this._shaCountRemove,
      LUA_COUNT_REMOVE,
      [this._bitKey, this._countKey],
      posArgs,
    );
    await this._redis.hincrby(this._metaKey, 'count', -1);
  }

  async stats(): Promise<BloomFilterStats> {
    const [meta, setBits] = await Promise.all([
      this._redis.hgetall(this._metaKey),
      this._redis.bitcount(this._bitKey),
    ]);

    const count = parseInt(meta?.count ?? '0', 10);
    const currentFPR = estimateFPR(this._k, count, this._m);
    const fillRatio = setBits / this._m;

    return {
      key: this._key,
      capacity: this._capacity,
      targetErrorRate: this._errorRate,
      estimatedCount: count,
      currentFPR: +currentFPR.toFixed(6),
      currentFPRPct: +(currentFPR * 100).toFixed(4) + '%',
      bitArraySize: this._m,
      hashFunctions: this._k,
      setBits,
      fillRatio: +fillRatio.toFixed(4),
      fillRatioPct: +(fillRatio * 100).toFixed(2) + '%',
      counting: this._counting,
      healthy: currentFPR <= this._errorRate * 1.5,
      createdAt: meta?.createdAt ? new Date(parseInt(meta.createdAt, 10)).toISOString() : null,
    };
  }

  async clear(): Promise<void> {
    const keys = [this._bitKey, this._metaKey];
    if (this._counting) keys.push(this._countKey);
    await this._redis.del(...keys);
  }

  get bitSize(): number {
    return this._m;
  }

  get hashCount(): number {
    return this._k;
  }

  get theoreticalFPR(): number {
    return estimateFPR(this._k, this._capacity, this._m);
  }

  private _getPositions(item: string): number[] {
    if (typeof item !== 'string' || item.length === 0) {
      throw new TypeError('BloomFilter: item must be a non-empty string');
    }
    return getHashPositions(item, this._k, this._m);
  }

  private async _evalsha(
    sha: string | null,
    script: string,
    keys: string[],
    args: string[],
  ): Promise<number> {
    try {
      return await this._redis.evalsha(sha as string, keys.length, ...keys, ...args) as number;
    } catch (err: any) {
      if (err?.message?.includes('NOSCRIPT')) {
        const result = await this._redis.eval(script, keys.length, ...keys, ...args) as number;
        await this._redis.script('LOAD', script);
        return result;
      }
      throw err;
    }
  }
}
