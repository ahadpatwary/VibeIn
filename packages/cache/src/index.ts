// Main service
export { RedisService } from './redis.service';
export { LuaHandler } from './luaHandler'
export { RedisClientManager } from './redis.client'

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
} from './types/redis.types';

// Exceptions
export {
    RedisException,
    RedisConnectionException,
    RedisCommandException,
    RedisTimeoutException,
    RedisSerializationException,
    RedisNotInitializedException,
} from './exceptions/redis.exception';

// Utils
export { RedisSerializer } from './utils/redis.serializer';

export * from './tokens/redis.token'


// Constants
export {
    REDIS_CONSTANTS,
    REDIS_ERRORS,
    REDIS_EVENTS,
    EXPIRE_MODES,
} from './constants/redis.constants';


export { registerRedis } from './container/container'