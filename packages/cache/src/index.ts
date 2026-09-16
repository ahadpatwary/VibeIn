// Main service
export { RedisService } from './redis.service.js';


// Config
// export { RedisConfigBuilder, createRedisConfig } from './config/redis.config.js';
export { loadRedisConfig } from './config/config'

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
    LoadedLuaScript,
    ScriptLoaderConfig,
} from './types/redis.types.js';

// Exceptions
export {
    RedisException,
    RedisConnectionException,
    RedisCommandException,
    RedisTimeoutException,
    RedisSerializationException,
    RedisNotInitializedException,
} from './exceptions/redis.exception.js';

// Utils
export { RedisSerializer } from './utils/redis.serializer.js';


// Constants
export {
    REDIS_CONSTANTS,
    REDIS_ERRORS,
    REDIS_EVENTS,
    EXPIRE_MODES,
} from './constants/redis.constants.js';
