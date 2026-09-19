import { Redis } from 'ioredis';
import {
  RateLimiterOptions,
  RateLimitDecision,
  RouteConfigWithKeyspace,
  IAlgorithmEngine,
  BanStatus,
  ViolationStatus,
  RateLimitAlgorithm,
} from './types';
import { FixedWindowCounter } from './algorithms/fixed-window';
import { SlidingWindowCounter } from './algorithms/sliding-window';
import { TokenBucket } from './algorithms/token-bucket';
import { LeakyBucket } from './algorithms/leaky-bucket';



const ALGORITHMS: Record<RateLimitAlgorithm, new (redis: Redis) => IAlgorithmEngine> = {
  'fixed-window': FixedWindowCounter,
  'sliding-window': SlidingWindowCounter,
  'token-bucket': TokenBucket,
  'leaky-bucket': LeakyBucket,
};

const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'sliding-window';
const PENALTY_KEY_PREFIX = 'rl:penalty';
const BLACKLIST_KEY = 'rl:blacklist';
const WHITELIST_KEY = 'rl:whitelist';

// Penalty: exponential backoff ban durations (seconds)
const PENALTY_TIERS: readonly number[] = [60, 300, 1800, 86400]; // 1m, 5m, 30m, 24h

// ─────────────────────────────────────────────────────────────────
//  Lua: Penalty system
// ─────────────────────────────────────────────────────────────────

/**
 * Increment violation count and set/extend ban.
 * Returns [violation_count, ban_ttl_secs]
 */
const LUA_PENALIZE = `
local violKey = KEYS[1]
local banKey  = KEYS[2]

local violations = tonumber(redis.call('INCR', violKey))
redis.call('EXPIRE', violKey, 86400 * 7)  -- track violations for 1 week

local tiers = #ARGV
local tier  = math.min(violations - 1, tiers - 1)
local banSecs = tonumber(ARGV[tier + 1])

redis.call('SET', banKey, violations)
redis.call('EXPIRE', banKey, banSecs)

return {violations, banSecs}
` as const;

// ─────────────────────────────────────────────────────────────────
//  RateLimiter
// ─────────────────────────────────────────────────────────────────

export class RateLimiter {
  private _redis: Redis;
  private _opts: Required<RateLimiterOptions>;
  private _engines: Map<RateLimitAlgorithm, IAlgorithmEngine>;
  private _penalizeSha: string | null = null;
  private _initialized: boolean = false;

  /**
   * Initialize rate limiter
   * @param redis - Redis client
   * @param globalOptions - Global rate limiter options
   */
  constructor(redis: Redis, globalOptions: RateLimiterOptions = {}) {
    if (!redis) throw new Error('RateLimiter: redis client is required');

    this._redis = redis;
    this._opts = {
      enablePenalty: globalOptions.enablePenalty ?? true,
      penaltyThreshold: globalOptions.penaltyThreshold ?? 10,
      failOpen: globalOptions.failOpen ?? false,
    };

    // Instantiate all algorithm engines
    this._engines = new Map();
    for (const [name, Cls] of Object.entries(ALGORITHMS)) {
      this._engines.set(name as RateLimitAlgorithm, new Cls(redis));
    }
  }

  /**
   * Initialize all algorithm engines and load Lua scripts
   */
  async init(): Promise<this> {
    await Promise.all(Array.from(this._engines.values()).map(e => e.init()));
    this._penalizeSha = await this._redis.script('LOAD', LUA_PENALIZE) as string || null;
    this._initialized = true;
    return this;
  }

  /**
   * Check and consume a rate limit token
   */
  async check(
    identifier: string,
    routeConfig: RouteConfigWithKeyspace
  ): Promise<RateLimitDecision> {
    if (!this._initialized) throw new Error('RateLimiter: call init() first');

    const algorithm = (routeConfig.algorithm ?? DEFAULT_ALGORITHM) as RateLimitAlgorithm;
    const engine = this._engines.get(algorithm);
    if (!engine) throw new Error(`RateLimiter: unknown algorithm "${algorithm}"`);

    // Namespace the identifier per route
    const namespacedId = routeConfig.keyspace
      ? `${routeConfig.keyspace}:${identifier}`
      : identifier;

    try {
      // ── 1. Whitelist check ────────────────────────────────────
      const whitelisted = await this._isWhitelisted(identifier);
      if (whitelisted) {
        return this._makeDecision(true, identifier, {
          allowed: true,
          limit: Infinity,
          remaining: Infinity,
          resetAt: new Date(),
          retryAfter: null,
          count: 0,
          algorithm: 'whitelist',
        }, routeConfig);
      }

      // ── 2. Blacklist check ────────────────────────────────────
      const blacklisted = await this._isBlacklisted(identifier);
      if (blacklisted) {
        return this._makeDecision(
          false,
          identifier,
          {
            allowed: false,
            limit: 0,
            remaining: 0,
            resetAt: new Date(Date.now() + 86400000),
            retryAfter: 86400,
            count: 0,
            algorithm: 'blacklist',
          },
          routeConfig,
          'BLACKLISTED'
        );
      }

      // ── 3. Penalty ban check ──────────────────────────────────
      if (this._opts.enablePenalty) {
        const ban = await this._checkBan(namespacedId);
        if (ban.banned) {
          return this._makeDecision(
            false,
            identifier,
            {
              allowed: false,
              limit: (routeConfig as any).limit ?? 0,
              remaining: 0,
              resetAt: new Date(Date.now() + ban.ttl * 1000),
              retryAfter: ban.ttl,
              count: 0,
              algorithm: 'penalty-ban',
            },
            routeConfig,
            'PENALTY_BAN'
          );
        }
      }

      // ── 4. Algorithm rate check ───────────────────────────────
      const result = await engine.consume(namespacedId, routeConfig);

      // ── 5. Apply penalty if rate exceeded ────────────────────
      if (!result.allowed && this._opts.enablePenalty) {
        await this._incrementViolation(namespacedId);
      }

      return this._makeDecision(result.allowed, identifier, result, routeConfig);
    } catch (err: any) {
      // ── Fail-open / fail-closed ───────────────────────────────
      if (this._opts.failOpen) {
        console.error('[RateLimiter] Redis error (fail-open):', err.message);
        return this._makeDecision(
          true,
          identifier,
          {
            allowed: true,
            limit: -1,
            remaining: -1,
            resetAt: new Date(),
            retryAfter: null,
            count: 0,
            algorithm: 'fail-open',
          },
          routeConfig,
          'FAIL_OPEN'
        );
      }
      throw err;
    }
  }

  /**
   * Add identifier to whitelist (bypass all rate limits)
   */
  async whitelist(identifier: string, ttlSecs: number | null = null): Promise<void> {
    if (ttlSecs) {
      await this._redis.set(`${WHITELIST_KEY}:${identifier}`, '1', 'EX', ttlSecs);
    } else {
      await this._redis.sadd(WHITELIST_KEY, identifier);
    }
  }

  /**
   * Remove identifier from whitelist
   */
  async unwhitelist(identifier: string): Promise<void> {
    await Promise.all([
      this._redis.srem(WHITELIST_KEY, identifier),
      this._redis.del(`${WHITELIST_KEY}:${identifier}`),
    ]);
  }

  /**
   * Permanently block an identifier
   */
  async blacklist(identifier: string, ttlSecs: number | null = null): Promise<void> {
    if (ttlSecs) {
      await this._redis.set(`${BLACKLIST_KEY}:${identifier}`, '1', 'EX', ttlSecs);
    } else {
      await this._redis.sadd(BLACKLIST_KEY, identifier);
    }
  }

  /**
   * Remove identifier from blacklist
   */
  async unblacklist(identifier: string): Promise<void> {
    await Promise.all([
      this._redis.srem(BLACKLIST_KEY, identifier),
      this._redis.del(`${BLACKLIST_KEY}:${identifier}`),
    ]);
  }

  /**
   * Reset all rate limit counters for an identifier + keyspace
   */
  async reset(identifier: string, keyspace: string | null = null): Promise<void> {
    const pattern = keyspace
      ? `rl:*:${keyspace}:${identifier}:*`
      : `rl:*:${identifier}:*`;
    const keys = await this._redis.keys(pattern);
    if (keys.length) await this._redis.del(...keys);

    // Also clear penalties
    await this._redis.del(
      `${PENALTY_KEY_PREFIX}:violations:${identifier}`,
      `${PENALTY_KEY_PREFIX}:ban:${identifier}`
    );
  }

  /**
   * Get current violation + ban status for an identifier
   */
  async getStatus(
    identifier: string,
    keyspace: string | null = null
  ): Promise<ViolationStatus> {
    const namespacedId = keyspace ? `${keyspace}:${identifier}` : identifier;

    const [violations, banTTL, whitelisted, blacklisted] = await Promise.all([
      this._redis.get(`${PENALTY_KEY_PREFIX}:violations:${namespacedId}`),
      this._redis.ttl(`${PENALTY_KEY_PREFIX}:ban:${namespacedId}`),
      this._isWhitelisted(identifier),
      this._isBlacklisted(identifier),
    ]);

    return {
      identifier,
      violations: parseInt(violations ?? '0', 10),
      banned: banTTL > 0,
      banTTL: banTTL > 0 ? banTTL : 0,
      whitelisted,
      blacklisted,
    };
  }

  // ── Private Helpers ───────────────────────────────────────────

  private async _isWhitelisted(id: string): Promise<boolean> {
    const [inSet, withTTL] = await Promise.all([
      this._redis.sismember(WHITELIST_KEY, id),
      this._redis.exists(`${WHITELIST_KEY}:${id}`),
    ]);
    return inSet === 1 || withTTL === 1;
  }

  private async _isBlacklisted(id: string): Promise<boolean> {
    const [inSet, withTTL] = await Promise.all([
      this._redis.sismember(BLACKLIST_KEY, id),
      this._redis.exists(`${BLACKLIST_KEY}:${id}`),
    ]);
    return inSet === 1 || withTTL === 1;
  }

  private async _checkBan(namespacedId: string): Promise<BanStatus> {
    const banKey = `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`;
    const ttl = await this._redis.ttl(banKey);
    return { banned: ttl > 0, ttl };
  }

  private async _incrementViolation(namespacedId: string): Promise<void> {
    const violKey = `${PENALTY_KEY_PREFIX}:violations:${namespacedId}`;
    const banKey = `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`;

    const violations = parseInt((await this._redis.get(violKey)) ?? '0', 10);

    if (violations >= this._opts.penaltyThreshold) {
      try {
        await this._redis.evalsha(
          this._penalizeSha!,
          2,
          violKey,
          banKey,
          ...PENALTY_TIERS.map(String)
        );
      } catch (err: any) {
        if (err.message?.includes('NOSCRIPT')) {
          await this._redis.eval(
            LUA_PENALIZE,
            2,
            violKey,
            banKey,
            ...PENALTY_TIERS.map(String)
          );
          this._penalizeSha = await this._redis.script('LOAD', LUA_PENALIZE) as string || null;
        } else {
          throw err;
        }
      }
    } else {
      await this._redis.incr(violKey);
      await this._redis.expire(violKey, 86400 * 7);
    }
  }

  private _makeDecision(
    allowed: boolean,
    identifier: string,
    result: any,
    routeConfig: RouteConfigWithKeyspace,
    reason?: 'OK' | 'RATE_LIMITED' | 'BLACKLISTED' | 'PENALTY_BAN' | 'FAIL_OPEN'
  ): RateLimitDecision {
    return {
      allowed,
      identifier,
      algorithm: result.algorithm,
      limit: result.limit,
      remaining: result.remaining,
      resetAt: result.resetAt,
      retryAfter: result.retryAfter,
      count: result.count,
      keyspace: routeConfig.keyspace ?? null,
      reason: reason ?? (allowed ? 'OK' : 'RATE_LIMITED'),
    };
  }
}

export default RateLimiter;