import { Redis } from 'ioredis';


export type RateLimitAlgorithm = 'fixed-window' | 'sliding-window' | 'token-bucket' | 'leaky-bucket';


export interface FixedWindowConfig {
  algorithm: 'fixed-window';
  limit: number;
  windowSecs: number;
}

export interface SlidingWindowConfig {
  algorithm: 'sliding-window';
  limit: number;
  windowSecs: number;
}

export interface TokenBucketConfig {
  algorithm: 'token-bucket';
  capacity: number;
  refillRate: number;
  cost?: number;
}

export interface LeakyBucketConfig {
  algorithm: 'leaky-bucket';
  capacity: number;
  leakRate: number;
}

/**
 * Route-specific rate limit configuration
 */
export type RouteConfig = FixedWindowConfig | SlidingWindowConfig | TokenBucketConfig | LeakyBucketConfig;

export type RouteConfigWithKeyspace = RouteConfig & {
  keyspace?: string;
};

/**
 * Rate limit decision response
 */
export interface RateLimitDecision {
  allowed: boolean;
  identifier: string;
  algorithm: string;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter: number | null;
  count: number;
  keyspace: string | null;
  reason: 'OK' | 'RATE_LIMITED' | 'BLACKLISTED' | 'PENALTY_BAN' | 'FAIL_OPEN';
}

/**
 * Internal algorithm result
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter: number | null;
  count: number;
  algorithm: string;
  _debug?: Record<string, any>;
}

/**
 * Violation and ban status
 */
export interface ViolationStatus {
  identifier: string;
  violations: number;
  banned: boolean;
  banTTL: number;
  whitelisted: boolean;
  blacklisted: boolean;
}

/**
 * Ban check result
 */
export interface BanStatus {
  banned: boolean;
  ttl: number;
}

/**
 * Global rate limiter options
 */
export interface RateLimiterOptions {
  enablePenalty?: boolean;
  penaltyThreshold?: number;
  failOpen?: boolean;
}

/**
 * Algorithm engine interface
 */
export interface IAlgorithmEngine {
  init(): Promise<this>;
  consume(identifier: string, config: RouteConfig): Promise<RateLimitResult>;
  name: string;
}

/**
 * Redis client type (for re-export)
 */
export type RedisClient = Redis;
