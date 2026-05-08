import { Redis } from 'ioredis';
import { IAlgorithmEngine, RateLimitResult, RouteConfig } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────
 *  ALGORITHM: Leaky Bucket
 * ─────────────────────────────────────────────────────────────────
 *  How it works:
 *    - Requests queue up in a "bucket".
 *    - The bucket "leaks" (processes) at a fixed rate.
 *    - If the bucket is full → reject (overflow).
 *    - Produces perfectly smooth output rate regardless of bursty input.
 *
 *  Pros:  Guarantees constant output rate — ideal for downstream
 *         protection. Prevents any bursty traffic from passing through.
 *
 *  Cons:  Burst requests are queued, not immediately processed.
 *         Higher latency. Less flexible than token bucket.
 *
 *  Used by: NGINX rate limiting, payment processors, systems where
 *           smooth consistent rate matters more than burst tolerance.
 *
 *  Redis structure:
 *    HASH  rl:lb:{identifier}  →  { queue_size, last_leak_at }
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Lua: Leak queue, then try to add incoming request.
 * Returns [allowed(0|1), queue_size, retry_secs]
 */
const LUA_LEAKY_BUCKET = `
local key        = KEYS[1]
local capacity   = tonumber(ARGV[1])
local leakRate   = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])
local ttl        = tonumber(ARGV[4])

local data       = redis.call('HMGET', key, 'queueSize', 'lastLeakAt')
local queueSize  = tonumber(data[1]) or 0
local lastLeakAt = tonumber(data[2]) or now

-- Leak: drain requests that have been processed since last check
local elapsed    = math.max(0, now - lastLeakAt)
local leaked     = math.floor((elapsed / 1000) * leakRate)
queueSize        = math.max(0, queueSize - leaked)

local allowed    = 0
local retrySecs  = 0

if queueSize < capacity then
  queueSize = queueSize + 1
  allowed   = 1
else
  -- Time until one slot frees up
  retrySecs = math.ceil(1 / leakRate)
end

redis.call('HMSET', key,
  'queueSize',  queueSize,
  'lastLeakAt', now
)
redis.call('EXPIRE', key, ttl)

return {allowed, queueSize, retrySecs}
` as const;

class LeakyBucket implements IAlgorithmEngine {
  private _redis: Redis;
  private _sha: string | null = null;

  constructor(redis: Redis) {
    this._redis = redis;
  }

  async init(): Promise<this> {
    this._sha = await this._redis.script('LOAD', LUA_LEAKY_BUCKET) as string || null;
    return this;
  }

  get name(): string {
    return 'leaky-bucket';
  }

  /**
   * @param {string} identifier
   * @param {object} config
   * @param {number} config.capacity   — max queue size (burst tolerance)
   * @param {number} config.leakRate   — requests processed per second
   * @returns {RateLimitResult}
   */
  async consume(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'leaky-bucket') {
      throw new Error(`LeakyBucket: expected leaky-bucket config, got ${config.algorithm}`);
    }

    const { capacity, leakRate } = config;
    const limit = capacity;
    const windowSecs = Math.ceil(capacity / leakRate);

    const key = `rl:lb:${identifier}`;
    const now = Date.now();
    const ttl = windowSecs + 60;

    let allowed: number;
    let queueSize: number;
    let retrySecs: number;

    try {
      [allowed, queueSize, retrySecs] = await this._redis.evalsha(
        this._sha!,
        1,
        key,
        capacity,
        leakRate,
        now,
        ttl
      ) as [number, number, number];
    } catch (err: any) {
      if (err.message?.includes('NOSCRIPT')) {
        [allowed, queueSize, retrySecs] = await this._redis.eval(
          LUA_LEAKY_BUCKET,
          1,
          key,
          capacity,
          leakRate,
          now,
          ttl
        ) as [number, number, number];
        this._sha = await this._redis.script('LOAD', LUA_LEAKY_BUCKET) as string || null;
      } else {
        throw err;
      }
    }

    const isAllowed = allowed === 1;
    const remaining = Math.max(0, capacity - queueSize);

    return {
      allowed: isAllowed,
      limit,
      remaining: isAllowed ? remaining : 0,
      resetAt: new Date(Date.now() + retrySecs * 1000),
      retryAfter: isAllowed ? null : retrySecs,
      count: queueSize,
      algorithm: this.name,
    };
  }
}

export { LeakyBucket };