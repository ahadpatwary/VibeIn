import { DRIZZLE_CONSTANTS } from "../constants/database.constants";
import { DatabaseConfig } from "../types/database.types";



export class DatabaseConfigBuilder {
    private config: Partial<DatabaseConfig> = {};

    setHost(host: string): this { this.config.host = host; return this; }
    setPort(port: number): this {
        if(port < 1 || port > 65535) {
            throw new Error(`Invalid port: ${port}`);
        }
        this.config.port = port; 
        return this;
    }
    setUsername(username: string): this { this.config.username = username; return this; }
    setPassword(password: string): this { this.config.password = password; return this; }
    database(database: string): this { this.config.database = database; return this; }
    maxConnections(maxConnections: number): this { this.config.maxConnections = maxConnections; return this; }
    minConnections(minConnections: number): this { this.config.minConnections = minConnections; return this; }
    connectionTimeout(connectionTimeout: number): this { this.config.connectionTimeout = connectionTimeout; return this; }
    idleTimeout(idleTimeout: number): this { this.config.idleTimeout = idleTimeout; return this; }
    keepAlive(keepAlive: boolean): this { this.config.keepAlive = keepAlive; return this; }
    keepAliveInitialDelay(keepAliveInitialDelay: number): this { this.config.keepAliveInitialDelay = keepAliveInitialDelay; return this; }
    connectionRetryDelay(connectionRetryDelay: number): this { this.config.connectionRetryDelay = connectionRetryDelay; return this; }
    connectionMaxRetries(connectionMaxRetries: number): this { this.config.connectionMaxRetries = connectionMaxRetries; return this; }

    build(): DatabaseConfig {
        return {
            host: DRIZZLE_CONSTANTS.DEFAULT_HOST,
            port: DRIZZLE_CONSTANTS.DEFAULT_PORT,
            username: DRIZZLE_CONSTANTS.DEFAULT_USER,
            password: DRIZZLE_CONSTANTS.DEFAULT_PASSWORD,
            database: DRIZZLE_CONSTANTS.DEFAULT_DATABASE,

            maxConnections: DRIZZLE_CONSTANTS.DEFAULT_MAX_CONNECTIONS,
            minConnections: DRIZZLE_CONSTANTS.DEFAULT_MIN_CONNECTIONS,

            connectionTimeout: DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_TIMEOUT,
            idleTimeout: DRIZZLE_CONSTANTS.DEFAULT_IDLE_TIMEOUT,

            keepAlive: DRIZZLE_CONSTANTS.DEFAULT_KEEPALIVE,
            keepAliveInitialDelay: DRIZZLE_CONSTANTS.DEFAULT_KEEPALIVE_INITIAL_DELAY,

            connectionRetryDelay: DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_RETRY_DELAY,
            connectionMaxRetries: DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_MAX_RETRIES,

            //________________________ override the previous values _______________________
            ...this.config,
        }
    }
} 

export function createDatabaseConfig(env?: NodeJS.ProcessEnv): DatabaseConfig {
    const e = env ?? process.env;

    const builder = new DatabaseConfigBuilder()
        .setHost(e.DB_HOST ?? DRIZZLE_CONSTANTS.DEFAULT_HOST)
        .setPort(parseInt(e.DB_PORT ?? String(DRIZZLE_CONSTANTS.DEFAULT_PORT), 10))
        .setUsername(e.DB_USER ?? DRIZZLE_CONSTANTS.DEFAULT_USER)
        .database(e.DB_NAME ?? DRIZZLE_CONSTANTS.DEFAULT_DATABASE)
        .maxConnections(parseInt(e.DB_MAX_CONNECTIONS ?? String(DRIZZLE_CONSTANTS.DEFAULT_MAX_CONNECTIONS), 10))
        .minConnections(parseInt(e.DB_MIN_CONNECTIONS ?? String(DRIZZLE_CONSTANTS.DEFAULT_MIN_CONNECTIONS), 10))
        .connectionTimeout(parseInt(e.DB_CONNECTION_TIMEOUT ?? String(DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_TIMEOUT), 10))
        .idleTimeout(parseInt(e.DB_IDLE_TIMEOUT ?? String(DRIZZLE_CONSTANTS.DEFAULT_IDLE_TIMEOUT), 10))
        .keepAlive(e.DB_KEEP_ALIVE ? e.DB_KEEP_ALIVE.toLowerCase() === 'true' : DRIZZLE_CONSTANTS.DEFAULT_KEEPALIVE)
        .keepAliveInitialDelay(parseInt(e.DB_KEEP_ALIVE_INITIAL_DELAY ?? String(DRIZZLE_CONSTANTS.DEFAULT_KEEPALIVE_INITIAL_DELAY), 10))
        .connectionRetryDelay(parseInt(e.DB_CONNECTION_RETRY_DELAY ?? String(DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_RETRY_DELAY), 10))
        .connectionMaxRetries(parseInt(e.DB_CONNECTION_MAX_RETRIES ?? String(DRIZZLE_CONSTANTS.DEFAULT_CONNECTION_MAX_RETRIES), 10))
    ;

    if (e.DB_PASSWORD) builder.setPassword(e.DB_PASSWORD);

    return builder.build();
}