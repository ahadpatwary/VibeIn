import {
  RateLimiterOptions,
  RateLimitDecision,
  RouteConfigWithKeyspace,
  RateLimitAlgorithm,
  RouteConfig,
  RateLimitResult,
} from './types/types';
import { inject, injectable } from 'tsyringe';
import { RATE_LIMIT_TOKENS } from './token/token';
import { StoreService } from './redis/redisService';
import { ILogger, LoggerFactory } from '@app/logger';
import { DEFAULT_ALGORITHM } from './constants/constant';



@injectable()
export class RateLimiter {
  private _initialized: boolean = false;
  private readonly logger: ILogger;

  
  constructor(
    @inject(RATE_LIMIT_TOKENS.RedisService)
    private readonly redisService: StoreService,

    @inject(RATE_LIMIT_TOKENS.GlobalOptions)
    private readonly globalOptions: Required<RateLimiterOptions>,


    @inject(RATE_LIMIT_TOKENS.Logger) factory: LoggerFactory,
  ) {
    this.logger = factory.forModule("RATE_LIMITER_MODULE");
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
    // const engine = this._engines.get(algorithm);
    // if (!engine) throw new Error(`RateLimiter: unknown algorithm "${algorithm}"`);

    /**
     * Namespace the identifier per route
     */
    const namespacedId = routeConfig.keyspace 
      ? `${routeConfig.keyspace}:${identifier}`
      : identifier
    ;


    try {
      /**
       * Whitelist check ────────────────────────────────────
       * -> No limitation
       * -> For admin and others official
       */
      const whitelisted = await this.redisService.isWhitelisted(identifier);
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

  
      /**
       * Blacklist check ────────────────────────────────────
       * -> user has been blocked
       * -> user can't access resourch without reset
       */
      const blacklisted = await this.redisService.isBlacklisted(identifier);
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

      /**
       * Penalty ban check ──────────────────────────────────
       * -> Temporary TTL time baned
       * -> After ttl user can access the resourch automatically
       */
      if (this.globalOptions.enablePenalty) {
        const ban = await this.redisService.checkBan(namespacedId);
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

      const result: RateLimitResult = await this.#executeAlgorithm(
        identifier,
        routeConfig
      );

      if (!result.allowed && this.globalOptions.enablePenalty) {
        await this.redisService.incrementViolation(
          namespacedId, 
          this.globalOptions.penaltyThreshold
        );
      }

      return this._makeDecision(result.allowed, identifier, result, routeConfig);
    } catch (err: any) {
      /**
       * ── Fail-open / fail-closed ───────────────────────────────
       * -> If query fail and failOpen = true => access resourch
       * -> If query fail and failOpen = false => access denay
       */
      if (this.globalOptions.failOpen) {
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

  async #executeAlgorithm(
    identifier: string,
    routeConfig: RouteConfig,
  ): Promise<RateLimitResult> {
    switch (routeConfig.algorithm) {
      case 'fixed-window':
        return this.#fixedWindow(identifier, routeConfig);

      case 'leaky-bucket':
        return this.#LeakyBucket(identifier, routeConfig);

      case 'sliding-window':
        return this.#slidingWindow(identifier, routeConfig);

      case 'token-bucket':
        return this.#tokenBucket(identifier, routeConfig);

      default:
        throw new Error(
          `Algorithm "${(routeConfig as any).algorithm}" is not supported`
        );
    }
  }

  async #fixedWindow(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'fixed-window') {
      throw new Error(`FixedWindowCounter: expected fixed-window config, got ${config.algorithm}`);
    }

    const { limit, windowSecs } = config;
    const windowId = Math.floor(Date.now() / 1000 / windowSecs);
    const key = `rl:fw:${identifier}:${windowId}`;

    const [count, ttl] = await this.redisService.luaExecute<[count:number, ttl: number]>(
      'fiexed-window',
      [key],
      [String(windowSecs), String(limit)]
    );

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
      algorithm: 'fixed-window',
    };
  }

  async #LeakyBucket(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'leaky-bucket') {
      throw new Error(`LeakyBucket: expected leaky-bucket config, got ${config.algorithm}`);
    }

    const { capacity, leakRate } = config;
    const limit = capacity;
    const windowSecs = Math.ceil(capacity / leakRate);

    const key = `rl:lb:${identifier}`;
    const now = Date.now();
    const ttl = windowSecs + 60;

    const [allowed, queueSize, retrySecs] =
      await this.redisService.luaExecute<
        [allowed: number, queueSize: number, retrySecs: number]
      >(
        'leaky-bucket',
        [key],
        [String(capacity), String(leakRate), String(now), String(ttl)]
      )
    ;

    const isAllowed = allowed === 1;
    const remaining = Math.max(0, capacity - queueSize);

    return {
      allowed: isAllowed,
      limit,
      remaining: isAllowed ? remaining : 0,
      resetAt: new Date(Date.now() + retrySecs * 1000),
      retryAfter: isAllowed ? null : retrySecs,
      count: queueSize,
      algorithm: 'leaky-bucket',
    };
  }


  async #slidingWindow(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'sliding-window') {
      throw new Error(`SlidingWindowCounter: expected sliding-window config, got ${config.algorithm}`);
    }

    const { limit, windowSecs } = config;

    const nowSecs = Math.floor(Date.now() / 1000);
    const windowId = Math.floor(nowSecs / windowSecs);
    const prevWindowId = windowId - 1;

    const currKey = `rl:sw:${identifier}:${windowId}`;
    const prevKey = `rl:sw:${identifier}:${prevWindowId}`;

    const [prevCount, currCount, prevTTL] = await this.redisService.luaExecute<
      [prevCound: number, currCount: number, prevTTL: number]
      >(
        'sliding-window',
        [currKey, prevKey],
        [String(windowSecs)]
      ) 
    ;

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
      algorithm: 'sliding-window',
      _debug: {
        prevCount,
        currCount,
        prevWindowWeight: parseFloat(prevWindowWeight.toFixed(3)),
      },
    };
  }

  async #tokenBucket(identifier: string, config: RouteConfig): Promise<RateLimitResult> {
    if (config.algorithm !== 'token-bucket') {
      throw new Error(`TokenBucket: expected token-bucket config, got ${config.algorithm}`);
    }

    const { capacity, refillRate, cost = 1 } = config;

    const limit = capacity;
    const windowSecs = Math.ceil(capacity / refillRate);

    const key = `rl:tb:${identifier}`;
    const now = Date.now();
    const ttl = windowSecs + 60;

    const [allowed, remaining, retrySecs] = await this.redisService.luaExecute<
      [allowed: number, remaining: number, retrySecs: number]
      >(
        'token-bucket',    
        [key], 
        [  
          String(capacity),
          String(refillRate),
          String(cost),
          String(now),
          String(ttl)
        ]
      )
    ;

    const isAllowed = allowed === 1;
    const resetAt = new Date(now + retrySecs * 1000);

    return {
      allowed: isAllowed,
      limit,
      remaining: isAllowed ? remaining : 0,
      resetAt,
      retryAfter: isAllowed ? null : retrySecs,
      count: limit - remaining,
      algorithm: 'token-bucket',
    };
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