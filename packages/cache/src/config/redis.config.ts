import { RedisConfig } from '../types/redis.types.js';
import { REDIS_CONSTANTS, REDIS_ERRORS } from '../constants/redis.constants.js';
import { RedisException } from '../exceptions/redis.exception.js';

export class RedisConfigBuilder {
    private config: Partial<RedisConfig> = {};

    setHost(host: string): this {
        this.config.host = host;
        return this;
    }

    setPort(port: number): this {
        if (port < 1 || port > 65535) {
            throw new RedisException(
                `Invalid port: ${port}`,
                REDIS_ERRORS.INVALID_CONFIG,
            );
        }
        this.config.port = port;
        return this;
    }

    setPassword(password?: string): this {
        this.config.password = password;
        return this;
    }
    setDatabase(db?: number): this {
        this.config.db = db;
        return this;
    }
    setKeyPrefix(prefix?: string): this {
        this.config.keyPrefix = prefix;
        return this;
    }
    enableTLS(): this {
        this.config.tls = true;
        return this;
    }
    setConnectTimeout(ms?: number): this {
        this.config.connectTimeout = ms;
        return this;
    }
    setCommandTimeout(ms?: number): this {
        this.config.commandTimeout = ms;
        return this;
    }
    setMaxRetries(retries?: number): this {
        this.config.maxRetriesPerRequest = retries;
        return this;
    }

    build(): RedisConfig {
        return {
            host: REDIS_CONSTANTS.DEFAULT_HOST,
            port: REDIS_CONSTANTS.DEFAULT_PORT,
            db: REDIS_CONSTANTS.DEFAULT_DB,
            keyPrefix: REDIS_CONSTANTS.DEFAULT_KEY_PREFIX,
            connectTimeout: REDIS_CONSTANTS.DEFAULT_CONNECT_TIMEOUT,
            commandTimeout: REDIS_CONSTANTS.DEFAULT_COMMAND_TIMEOUT,
            maxRetriesPerRequest: REDIS_CONSTANTS.DEFAULT_MAX_RETRIES,
            enableReadyCheck: true,
            lazyConnect: true,
            keepAlive: REDIS_CONSTANTS.DEFAULT_KEEPALIVE,

            //________________________ override the previous values _______________________
            ...this.config,
        };
    }
}

export function createRedisConfig(config: RedisConfig): RedisConfig {
    const {
        host,
        port,
        password,
        db,
        keyPrefix,
        tls,
        connectTimeout,
        commandTimeout,
        maxRetriesPerRequest,
        retryStrategy,
        enableReadyCheck,
        lazyConnect,
        keepAlive,
        family,
        sentinels,
        name, // Sentinel master name
        clusterMode,
        clusterNodes,
    }: RedisConfig = config;

    const builder = new RedisConfigBuilder()
        .setHost(host)
        .setPort(port)
        .setDatabase(db)
        .setKeyPrefix(keyPrefix)
        .setConnectTimeout(connectTimeout)
        .setCommandTimeout(commandTimeout)
        .setMaxRetries(maxRetriesPerRequest);

    if (password) builder.setPassword(password);
    // if (config. === 'true') builder.enableTLS();

    return builder.build();
}
