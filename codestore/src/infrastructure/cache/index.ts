// Main service
export { RedisService } from './redis.service';

// Client
export { RedisClient } from './redis.client';

// Config
export { RedisConfigBuilder, createRedisConfig } from './config/redis.config';

// Types
export type {
  RedisConfig,
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
  RedisValue,
  Nullable,
  MaybeArray,
} from './types/redis.types';

// Exceptions
export {
  RedisException,
  RedisConnectionException,
  RedisCommandException,
  RedisTimeoutException,
  RedisLockException,
  RedisSerializationException,
  RedisNotInitializedException,
} from './exceptions/redis.exception';

// Utils
export { RedisSerializer } from './utils/redis.serializer';
export { RedisLogger, NoopLogger } from './utils/redis.logger';
export type { Logger, LogLevel } from './utils/redis.logger';

// Decorators / Helpers
export { withRetry, withCommandError, Retry } from './decorators/retry.decorator';
export type { RetryOptions } from './decorators/retry.decorator';

// Constants
export { REDIS_CONSTANTS, REDIS_ERRORS, REDIS_EVENTS, EXPIRE_MODES } from './constants/redis.constants';