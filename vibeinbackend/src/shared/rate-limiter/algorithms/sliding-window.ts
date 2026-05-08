import { readFileSync } from 'fs';
import { join } from 'path';
import { Redis } from 'ioredis';
import { IAlgorithmEngine, RateLimitResult, RouteConfig } from '../types';

/**
 * ─────────────────────────────────────────────────────────────────
 *  ALGORITHM: Sliding Window Counter
 * ─────────────────────────────────────────────────────────────────
 *  How it works:
 *    - Tracks the CURRENT and PREVIOUS window counters.
 *    - Calculates a weighted count:
 *        weighted = prev_count × (remaining_prev_window / window_size)
 *                 + current_count
 *    - Smooth approximation of a true sliding window.
 *    - No boundary burst problem.
 *
 *  Pros:  Very accurate, O(1) memory, no burst issue.
 *         Only 2 Redis keys per identifier (not unbounded like log).
 *
 *  Cons:  Approximate (not exact sliding log).
 *
 *  Used by: Cloudflare, Stripe, most production-grade APIs.
 *           The de-facto industry standard for rate limiting.
 * ─────────────────────────────────────────────────────────────────
 */

/**
 * Lua: Atomically get prev/current counters and increment current.
 * Returns [prev_count, current_count, prev_ttl]
 */
// const LUA_SLIDING_WINDOW = `
// local curr_key  = KEYS[1]
// local prev_key  = KEYS[2]
// local window    = tonumber(ARGV[1])

// local prev_count = tonumber(redis.call('GET', prev_key)) or 0
// local curr_count = redis.call('INCR', curr_key)
// if curr_count == 1 then
//   redis.call('EXPIRE', curr_key, window * 2)
// end
// local prev_ttl = tonumber(redis.call('TTL', prev_key)) or 0
// return {prev_count, curr_count, prev_ttl}
// ` as const;

const LUA_SLIDING_WINDOW = readFileSync(
  join(__dirname, '../scripts/sliding_window.lua'),
  'utf-8',
);

export class SlidingWindowCounter implements IAlgorithmEngine {
  private _redis: Redis;
  private _sha: string | null = null;

  constructor(redis: Redis) {
    this._redis = redis;
  }

  async init(): Promise<this> {
    this._sha = await this._redis.script('LOAD', LUA_SLIDING_WINDOW) as string || null;
    return this;
  }

  get name(): string {
    return 'sliding-window';
  }

  /**
   * Consume tokens using sliding window algorithm
   * @param identifier - Unique identifier (IP, userID, etc.)
   * @param config - Rate limit configuration
   * @returns Rate limit result
   */
  async consume(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'sliding-window') {
      throw new Error(`SlidingWindowCounter: expected sliding-window config, got ${config.algorithm}`);
    }

    const { limit, windowSecs } = config;

    const nowSecs = Math.floor(Date.now() / 1000);
    const windowId = Math.floor(nowSecs / windowSecs);
    const prevWindowId = windowId - 1;

    const currKey = `rl:sw:${identifier}:${windowId}`;
    const prevKey = `rl:sw:${identifier}:${prevWindowId}`;

    let prevCount: number;
    let currCount: number;
    let prevTTL: number;

    try {
      [prevCount, currCount, prevTTL] = await this._redis.evalsha(
        this._sha!,
        2,
        currKey,
        prevKey,
        windowSecs
      ) as [number, number, number];
    } catch (err: any) {
      if (err.message?.includes('NOSCRIPT')) {
        [prevCount, currCount, prevTTL] = await this._redis.eval(
          LUA_SLIDING_WINDOW,
          2,
          currKey,
          prevKey,
          windowSecs
        ) as [number, number, number];
        this._sha = await this._redis.script('LOAD', LUA_SLIDING_WINDOW) as string || null;
      } else {
        throw err;
      }
    }

    // Calculate weighted count (Cloudflare's formula)
    const elapsedInWindow = nowSecs % windowSecs;
    const prevWindowWeight = (windowSecs - elapsedInWindow) / windowSecs;
    const weightedCount = Math.floor(prevCount * prevWindowWeight) + currCount;

    const allowed = weightedCount <= limit;
    const remaining = Math.max(0, limit - weightedCount);
    const resetSecs = windowSecs - elapsedInWindow;
    const resetAt = new Date(Date.now() + resetSecs * 1000);

    return {
      allowed,
      limit,
      remaining: allowed ? remaining : 0,
      resetAt,
      retryAfter: allowed ? null : resetSecs,
      count: weightedCount,
      algorithm: this.name,
      _debug: {
        prevCount,
        currCount,
        prevWindowWeight: parseFloat(prevWindowWeight.toFixed(3)),
      },
    };
  }
}