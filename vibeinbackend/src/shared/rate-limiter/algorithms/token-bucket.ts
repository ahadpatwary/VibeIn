import { Redis } from 'ioredis';
import { IAlgorithmEngine, RateLimitResult, RouteConfig } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────
 *  ALGORITHM: Token Bucket
 * ─────────────────────────────────────────────────────────────────
 *  How it works:
 *    - A "bucket" holds tokens (max = burst capacity).
 *    - Tokens are added at a fixed REFILL RATE (tokens/second).
 *    - Each request CONSUMES tokens (default: 1 per request).
 *    - If not enough tokens → reject.
 *    - Bucket never overflows past the burst limit.
 *
 *  Pros:  Handles bursts gracefully. Smooth traffic shaping.
 *         Most flexible — different cost per operation.
 *
 *  Cons:  Slightly more complex. Requires storing timestamp.
 *
 *  Used by: AWS API Gateway, GCP Cloud Endpoints, Shopify,
 *           any system where burst traffic is acceptable.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Lua: Atomically refill tokens based on elapsed time, then consume.
 * Returns [allowed(0|1), remaining_tokens, next_refill_in_ms]
 */
const LUA_TOKEN_BUCKET = `
local key         = KEYS[1]
local capacity    = tonumber(ARGV[1])
local refillRate  = tonumber(ARGV[2])
local cost        = tonumber(ARGV[3])
local now         = tonumber(ARGV[4])
local ttl         = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'lastRefillAt')
local tokens       = tonumber(data[1]) or capacity
local lastRefillAt = tonumber(data[2]) or now

-- Refill tokens based on elapsed time
local elapsed      = math.max(0, now - lastRefillAt)
local refillAmount = (elapsed / 1000) * refillRate
tokens = math.min(capacity, tokens + refillAmount)

local allowed = 0
local remaining = tokens

if tokens >= cost then
  tokens  = tokens - cost
  allowed = 1
  remaining = tokens
end

-- Persist state
redis.call('HMSET', key,
  'tokens',       tokens,
  'lastRefillAt', now
)
redis.call('EXPIRE', key, ttl)

-- Time until 1 token is refilled (for Retry-After)
local retrySecs = 0
if allowed == 0 then
  retrySecs = math.ceil((cost - tokens) / refillRate)
end

return {allowed, math.floor(remaining), retrySecs}
` as const;

export class TokenBucket implements IAlgorithmEngine {
  private _redis: Redis;
  private _sha: string | null = null;

  constructor(redis: Redis) {
    this._redis = redis;
  }

  async init(): Promise<this> {
    this._sha = await this._redis.script('LOAD', LUA_TOKEN_BUCKET) as string || null;
    return this;
  }

  get name(): string {
    return 'token-bucket';
  }

  /**
   * Consume tokens using token bucket algorithm
   * @param identifier - Unique identifier (IP, userID, etc.)
   * @param config - Rate limit configuration with capacity, refillRate, and cost
   * @returns Rate limit result
   */
  async consume(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'token-bucket') {
      throw new Error(`TokenBucket: expected token-bucket config, got ${config.algorithm}`);
    }

    const { capacity, refillRate, cost = 1 } = config;

    const limit = capacity;
    const windowSecs = Math.ceil(capacity / refillRate);

    const key = `rl:tb:${identifier}`;
    const now = Date.now();
    const ttl = windowSecs + 60;

    let allowed: number;
    let remaining: number;
    let retrySecs: number;

    try {
      [allowed, remaining, retrySecs] = await this._redis.evalsha(
        this._sha!,
        1,
        key,
        capacity,
        refillRate,
        cost,
        now,
        ttl
      ) as [number, number, number];
    } catch (err: any) {
      if (err.message?.includes('NOSCRIPT')) {
        [allowed, remaining, retrySecs] = await this._redis.eval(
          LUA_TOKEN_BUCKET,
          1,
          key,
          capacity,
          refillRate,
          cost,
          now,
          ttl
        ) as [number, number, number];

        this._sha = await this._redis.script('LOAD', LUA_TOKEN_BUCKET) as string || null;
      } else {
        throw err;
      }
    }

    const isAllowed = allowed === 1;
    const resetAt = new Date(now + retrySecs * 1000);

    return {
      allowed: isAllowed,
      limit,
      remaining: isAllowed ? remaining : 0,
      resetAt,
      retryAfter: isAllowed ? null : retrySecs,
      count: limit - remaining,
      algorithm: this.name,
    };
  }
}