export const REDIS_CONSTANTS = {
    DEFAULT_HOST: 'localhost',
    DEFAULT_PORT: 6379,
    DEFAULT_DB: 0,
    DEFAULT_KEY_PREFIX: '',
    DEFAULT_TTL: 3600, // 1 hour in seconds
    DEFAULT_CONNECT_TIMEOUT: 10_000, // 10 seconds
    DEFAULT_COMMAND_TIMEOUT: 5_000, // 5 seconds
    DEFAULT_MAX_RETRIES: 3,
    DEFAULT_RETRY_DELAY: 1_000, // 1 second
    DEFAULT_KEEPALIVE: 10_000,

    // Lock
    LOCK_PREFIX: 'lock:',
    DEFAULT_LOCK_TTL: 30, // seconds
    DEFAULT_LOCK_RETRY_COUNT: 3,
    DEFAULT_LOCK_RETRY_DELAY: 100, // ms

    // Rate Limit
    RATE_LIMIT_PREFIX: 'rl:',

    // Session
    SESSION_PREFIX: 'session:',
    DEFAULT_SESSION_TTL: 86_400, // 24 hours

    // Cache
    CACHE_PREFIX: 'cache:',

    // Queue
    QUEUE_PREFIX: 'queue:',

    // Pub/Sub
    CHANNEL_PREFIX: 'channel:',

    // Health Check
    PING_RESPONSE: 'PONG',

    // Cursor
    SCAN_START_CURSOR: '0',
    SCAN_DEFAULT_COUNT: 100,

    // Max pipeline batch size
    MAX_PIPELINE_BATCH: 500,
} as const;

export const REDIS_ERRORS = {
    CONNECTION_FAILED: 'REDIS_CONNECTION_FAILED',
    COMMAND_FAILED: 'REDIS_COMMAND_FAILED',
    TIMEOUT: 'REDIS_TIMEOUT',
    LOCK_ACQUISITION_FAILED: 'REDIS_LOCK_ACQUISITION_FAILED',
    LOCK_RELEASE_FAILED: 'REDIS_LOCK_RELEASE_FAILED',
    KEY_NOT_FOUND: 'REDIS_KEY_NOT_FOUND',
    SERIALIZATION_ERROR: 'REDIS_SERIALIZATION_ERROR',
    DESERIALIZATION_ERROR: 'REDIS_DESERIALIZATION_ERROR',
    INVALID_CONFIG: 'REDIS_INVALID_CONFIG',
    NOT_INITIALIZED: 'REDIS_NOT_INITIALIZED',
} as const;

export const REDIS_EVENTS = {
    CONNECTING: 'connecting',
    WAIT: 'wait',
    CONNECT: 'connect',
    READY: 'ready',
    ERROR: 'error',
    CLOSE: 'close',
    RECONNECTING: 'reconnecting',
    END: 'end',
} as const;

export const EXPIRE_MODES = {
    NX: 'NX', // Set expiry only when key has no expiry
    XX: 'XX', // Set expiry only when key has an expiry
    GT: 'GT', // Set expiry only when new expiry > current expiry
    LT: 'LT', // Set expiry only when new expiry < current expiry
} as const;
