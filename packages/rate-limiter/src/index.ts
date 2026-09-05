/**
 * Rate Limiter - Industry Standard Implementation
 *
 * Four algorithms:
 * - sliding-window: Most accurate, no burst issue (default, production-grade)
 * - fixed-window: Simple, O(1) memory, has boundary burst problem
 * - token-bucket: Burst-tolerant, flexible cost per request
 * - leaky-bucket: Smooth output rate, zero burst tolerance
 *
 * Features:
 * - Automatic penalty system (exponential backoff)
 * - Whitelist/Blacklist management
 * - Fail-open/fail-closed modes
 * - Redis-backed, Lua atomic operations
 */

export { RateLimiter } from './rete-limiter';
export { SlidingWindowCounter } from './algorithms/sliding-window';
export { FixedWindowCounter } from './algorithms/fixed-window';
export { TokenBucket } from './algorithms/token-bucket';
export { LeakyBucket } from './algorithms/leaky-bucket';

export type {
  RateLimitAlgorithm,
  RateLimitDecision,
  RateLimitResult,
  RouteConfig,
  RouteConfigWithKeyspace,
  ViolationStatus,
  BanStatus,
  RateLimiterOptions,
  IAlgorithmEngine,
  FixedWindowConfig,
  SlidingWindowConfig,
  TokenBucketConfig,
  LeakyBucketConfig,
} from './types';

export { default as RateLimiterDefault } from './rete-limiter';
