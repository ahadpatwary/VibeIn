//drizzle connection constant variable
export const DRIZZLE_CONSTANTS = {
    DEFAULT_HOST: 'localhost',
    DEFAULT_PORT: 5432,
    DEFAULT_USER: 'postgres',
    DEFAULT_PASSWORD: 'password',
    DEFAULT_DATABASE: 'mydb',

    DEFAULT_MAX_CONNECTIONS: 10,
    DEFAULT_MIN_CONNECTIONS: 0,

    DEFAULT_CONNECTION_TIMEOUT: 10_000, // 10 seconds
    DEFAULT_IDLE_TIMEOUT: 30_000, // 30 seconds

    DEFAULT_KEEPALIVE: true, // 10 
    DEFAULT_KEEPALIVE_INITIAL_DELAY: 10_000, // 10 seconds


    DEFAULT_CONNECTION_RETRY_DELAY: 1_000, // 1 second
    DEFAULT_CONNECTION_MAX_RETRIES: 3,

} as const;

export const DATABASE_EVENTS = {
  CONNECT: 'connect',
  READY: 'ready',
  ERROR: 'error',
  CLOSE: 'close',
  RECONNECTING: 'reconnecting',
  END: 'end',
} as const;