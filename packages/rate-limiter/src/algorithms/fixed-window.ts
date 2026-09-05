import { Redis } from 'ioredis';
import { IAlgorithmEngine, RateLimitResult, RouteConfig } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────
 *  ALGORITHM: Fixed Window Counter
 * ─────────────────────────────────────────────────────────────────
 *  How it works:
 *    - Time is divided into fixed windows (e.g., every 60 seconds).
 *    - Each window has a counter. Requests increment the counter.
 *    - If counter > limit → reject.
 *
 *  Pros:  Simple, O(1) memory per key, predictable.
 *  Cons:  Boundary burst problem — a client can send 2x requests
 *         at the window boundary (last second + first second of next).
 *
 *  Used by: Early-stage APIs, internal services, simple admin panels.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Lua: Atomically increment counter and set TTL on first request.
 * Returns [count, ttl_ms_remaining]
 */
const LUA_FIXED_WINDOW = `
local key     = KEYS[1]
local windowTime  = tonumber(ARGV[1])
local count   = redis.call('INCR', key)

if count == 1 then                -- first request, set TTL
  redis.call('EXPIRE', key, windowTime)
end

local ttl = redis.call('TTL', key)
return {count, ttl}
` as const;

export class FixedWindowCounter implements IAlgorithmEngine {
  private _redis: Redis;
  private _sha: string | null = null;

  constructor(redis: Redis) {
    this._redis = redis;
  }

  async init(): Promise<this> {
    this._sha = await this._redis.script('LOAD', LUA_FIXED_WINDOW) as string || null;
  }

  get name(): string {
    return 'fixed-window';
  }

  /**
   * Consume tokens using fixed window algorithm
   * @param identifier - Unique identifier (IP, userID, etc.)
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  async consume(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'fixed-window') {
      throw new Error(`FixedWindowCounter: expected fixed-window config, got ${config.algorithm}`);
    }

    const { limit, windowSecs } = config;
    const windowId = Math.floor(Date.now() / 1000 / windowSecs);
    const key = `rl:fw:${identifier}:${windowId}`;

    let count: number;
    let ttl: number;

    try {
      [count, ttl] = await this._redis.evalsha(this._sha!, 1, key, windowSecs, limit) as [number, number];
    } catch (err: any) {
      if (err.message?.includes('NOSCRIPT')) {
        // [count, ttl] = await this._redis.eval(LUA_FIXED_WINDOW, 1, key, windowSecs, limit) as [number, number];
        this._sha = await this._redis.script('LOAD', LUA_FIXED_WINDOW) as string || null;
        [count, ttl] = await this._redis.evalsha(this._sha!, 1, key, windowSecs, limit) as [number, number];
      } else {
        throw err;
      }
    }

    const remaining = Math.max(0, limit - count);
    const resetMs = Date.now() + (ttl > 0 ? ttl * 1000 : windowSecs * 1000);
    const allowed = count <= limit;

    return {
      allowed,
      limit,
      remaining: allowed ? remaining : 0,
      resetAt: new Date(resetMs),
      retryAfter: allowed ? null : ttl,
      count,
      algorithm: this.name,
    };
  }
}