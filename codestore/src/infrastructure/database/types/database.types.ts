export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;

    maxConnections?: number;
    minConnections?: number;

    connectionTimeout?: number; // ms
    idleTimeout?: number; // ms

    keepAlive?: boolean;
    keepAliveInitialDelay?: number; // ms

    connectionRetryDelay?: number; // ms
    connectionMaxRetries?: number;
}