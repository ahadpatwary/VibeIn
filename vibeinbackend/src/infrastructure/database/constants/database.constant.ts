import { RetryConfig } from "../types/database.type";

export const DATABASE_CONSTANTS = {
    DEFAULT_URI: 'https://localhost:3000',
    DEFAULT_DB_NAME: 'vibein',
    DEFAULT_MAX_POOL_SIZE: 10,
    DEFAULT_MIN_POOL_SIZE: 1,
    CONNECTION_TIMEOUT_MS: 10000,
    SOCKET_TIMEOUT_MS: 45000,
    SERVER_SELECTION_TIMEOUT_MS: 10000,
    RETRY_WRITES: true,
    AUTO_INDEX: true,


    MAX_CONNECTION_RETRY: 10,
    MAX_COMMAND_RETRY: 3,
}   

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxAttempts: 5,
    initialDelay: 1_000,
    multiplier: 2,
    maxDelay: 60_000,
    jitter: true,
};


export const DATABASE_ERRORS = {
    // connection lifecycle
    CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
    NOT_INITIALIZED: 'DB_NOT_INITIALIZED',
    DISCONNECTED: 'DB_DISCONNECTED',
    SERVER_SELECTION_TIMEOUT: 'DB_SERVER_SELECTION_TIMEOUT',

    // schema / document level (mongoose)
    VALIDATION_FAILED: 'DB_VALIDATION_FAILED',
    CAST_ERROR: 'DB_CAST_ERROR',
    STRICT_MODE_VIOLATION: 'DB_STRICT_MODE_VIOLATION',
    PARALLEL_SAVE: 'DB_PARALLEL_SAVE',
    VERSION_CONFLICT: 'DB_VERSION_CONFLICT',
    DOCUMENT_NOT_FOUND: 'DB_DOCUMENT_NOT_FOUND',

    // write operations
    DUPLICATE_KEY: 'DB_DUPLICATE_KEY',
    WRITE_CONFLICT: 'DB_WRITE_CONFLICT',
    BULK_WRITE_FAILED: 'DB_BULK_WRITE_FAILED',
    WRITE_CONCERN_FAILED: 'DB_WRITE_CONCERN_FAILED',

    // transactions
    TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED',
    TRANSACTION_ABORTED: 'DB_TRANSACTION_ABORTED',
    NO_SUCH_TRANSACTION: 'DB_NO_SUCH_TRANSACTION',

    // query / command level
    QUERY_FAILED: 'DB_QUERY_FAILED',
    COMMAND_TIMEOUT: 'DB_COMMAND_TIMEOUT',
    CURSOR_ERROR: 'DB_CURSOR_ERROR',

    // misc
    SERIALIZATION_ERROR: 'DB_SERIALIZATION_ERROR',
    UNKNOWN: 'DB_UNKNOWN_ERROR',
} as const;

export type TDatabaseErrorCode = (typeof DATABASE_ERRORS)[keyof typeof DATABASE_ERRORS];

/** MongoDB server error codes worth distinguishing individually */
export const MONGO_SERVER_ERROR_CODES = {
    DUPLICATE_KEY: 11000,
    DUPLICATE_KEY_LEGACY: 11001,
    WRITE_CONFLICT: 112,
    NO_SUCH_TRANSACTION: 251,
    TRANSACTION_ABORTED: 244,
    EXCEEDED_TIME_LIMIT: 50,
} as const;

export const DATABASE_EVENTS = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    OPEN: 'open',
    DISCONNECTING: 'disconnecting',
    DISCONNECTED: 'disconnected',
    CLOSE: 'close',
    RECONNECTED: 'reconnected',
    ERROR: 'error',
    FULLSETUP: 'fullsetup',
} as const;

// const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/mongoose_test');

// conn.on('connected', () => console.log('connected'));
// conn.on('open', () => console.log('open'));
// conn.on('disconnected', () => console.log('disconnected'));
// conn.on('reconnected', () => console.log('reconnected'));
// conn.on('disconnecting', () => console.log('disconnecting'));
// conn.on('close', () => console.log('close'));

// const conn = mongoose.createConnection('mongodb://127.0.0.1:27017/mongoose_test');

// conn.on('connected', () => console.log('connected'));
// conn.on('open', () => console.log('open'));
// conn.on('disconnected', () => console.log('disconnected'));
// conn.on('reconnected', () => console.log('reconnected'));
// conn.on('disconnecting', () => console.log('disconnecting'));
// conn.on('close', () => console.log('close'));

export type TDatabaseEvent = (typeof DATABASE_EVENTS)[keyof typeof DATABASE_EVENTS];