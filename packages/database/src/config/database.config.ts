import { ArgumentOutOfRangeError } from "rxjs";
import { DATABASE_CONSTANTS } from "../constants/database.constant";
import { DatabaseConfig } from "../types/database.type";

export class DatabaseConfigBuilder {
    private config: Partial<DatabaseConfig> = {}

    constructor() {}

    setDbUri(uri: string): this { this.config.uri = uri; return this; }
    setDbName(dbName?: string): this { this.config.dbName = dbName; return this; }
    setMaxPoolSize(size?: number): this { this.config.maxPoolSize = size; return this; }
    setMinPoolSize(size?: number): this { this.config.minPoolSize = size; return this; }
    setConnectionTimeout(time?: number): this { this.config.connectTimeoutMS = time; return this; }
    setSocketTimeout(time?: number): this { this.config.socketTimeoutMS = time; return this; }
    setServerSelectionTimeout(time?: number): this { this.config.serverSelectionTimeoutMS = time; return this; }
    setRetryWrites(value?: boolean): this { this.config.retryWrites = value; return this; }
    setAutoIndex(value?: boolean): this { this.config.autoIndex = value; return this; }
    setMaxConnectionRetry(value?: number): this { this.config.maxConnectionRetries = value; return this; }
    setMaxCommandRetry(value?: number): this { this.config.maxCommandRetries = value; return this; }

    build(): DatabaseConfig {
        return {
            uri: DATABASE_CONSTANTS.DEFAULT_URI,
            dbName: DATABASE_CONSTANTS.DEFAULT_DB_NAME,
            maxPoolSize: DATABASE_CONSTANTS.DEFAULT_MAX_POOL_SIZE,
            minPoolSize: DATABASE_CONSTANTS.DEFAULT_MIN_POOL_SIZE,
            connectTimeoutMS: DATABASE_CONSTANTS.CONNECTION_TIMEOUT_MS,
            socketTimeoutMS: DATABASE_CONSTANTS.SOCKET_TIMEOUT_MS,
            serverSelectionTimeoutMS: DATABASE_CONSTANTS.SERVER_SELECTION_TIMEOUT_MS,
            retryWrites: DATABASE_CONSTANTS.RETRY_WRITES,
            autoIndex: DATABASE_CONSTANTS.AUTO_INDEX,
            /** Our own connection-attempt retry loop (separate from the driver's internal replica-set retries) */
            maxConnectionRetries: DATABASE_CONSTANTS.MAX_CONNECTION_RETRY,
            maxCommandRetries: DATABASE_CONSTANTS.MAX_COMMAND_RETRY,

            ...this.config
        }
    }

}

export function createDatabaseConfig(arg: DatabaseConfig): DatabaseConfig {
    const env = process.env;

    const builder = new DatabaseConfigBuilder()
        .setDbUri(env.DB_URI ?? arg.uri)
        .setDbName(env.DB_NAME ?? arg.dbName)
        .setMaxPoolSize(Number(env.MAX_POOL_SIZE) ?? arg.maxPoolSize)
        .setMinPoolSize(Number(env.MIN_POOL_SIZE) ?? arg.minPoolSize)
        .setConnectionTimeout(Number(env.CONNECTION_TIMEOUT_MS) ?? arg.connectTimeoutMS)
        .setSocketTimeout(Number(env.SOCKET_TIMEOUT_MS) ?? arg.socketTimeoutMS)
        .setServerSelectionTimeout(Number(env.SERVER_SELECTION_TIMEOUT_MS) ?? arg.serverSelectionTimeoutMS)
        .setRetryWrites(Boolean(env.RETRY_WRITES) ?? arg.retryWrites)
        .setAutoIndex(Boolean(env.AUTO_INDEX) ?? arg.autoIndex)
        .setMaxConnectionRetry(Number(env.MAX_CONNECTION_RETRY) ?? arg.maxCommandRetries)
        .setMaxCommandRetry(Number(env.MAX_COMMAND_RETRY) ?? arg.maxCommandRetries)
    ;

    return builder.build()

}