import { RedisConfig } from '../types/redis.types';
import { REDIS_CONSTANTS, REDIS_ERRORS } from '../constants/redis.constants';
import { RedisException } from '../exceptions/redis.exception';

export class RedisConfigBuilder {
  private config: Partial<RedisConfig> = {};

  setHost(host: string): this { this.config.host = host; return this; }

  setPort(port: number): this {
    if (port < 1 || port > 65535) {
      throw new RedisException(`Invalid port: ${port}`, REDIS_ERRORS.INVALID_CONFIG);
    }
    this.config.port = port;
    return this;
  }

  setPassword(password: string): this { this.config.password = password; return this; }
  setDatabase(db: number): this { this.config.db = db; return this; }
  setKeyPrefix(prefix: string): this { this.config.keyPrefix = prefix; return this; }
  enableTLS(): this { this.config.tls = true; return this; }
  setConnectTimeout(ms: number): this { this.config.connectTimeout = ms; return this; }
  setCommandTimeout(ms: number): this { this.config.commandTimeout = ms; return this; }
  setMaxRetries(retries: number): this { this.config.maxRetriesPerRequest = retries; return this; }

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

export function createRedisConfig(env?: NodeJS.ProcessEnv): RedisConfig {
  const e = env ?? process.env;
  const builder = new RedisConfigBuilder()
    .setHost(e.REDIS_HOST ?? REDIS_CONSTANTS.DEFAULT_HOST)
    .setPort(parseInt(e.REDIS_PORT ?? String(REDIS_CONSTANTS.DEFAULT_PORT), 10))
    .setDatabase(parseInt(e.REDIS_DB ?? String(REDIS_CONSTANTS.DEFAULT_DB), 10))
    .setKeyPrefix(e.REDIS_KEY_PREFIX ?? REDIS_CONSTANTS.DEFAULT_KEY_PREFIX)
    .setConnectTimeout(parseInt(e.REDIS_CONNECT_TIMEOUT ?? String(REDIS_CONSTANTS.DEFAULT_CONNECT_TIMEOUT), 10))
    .setCommandTimeout(parseInt(e.REDIS_COMMAND_TIMEOUT ?? String(REDIS_CONSTANTS.DEFAULT_COMMAND_TIMEOUT), 10))
    .setMaxRetries(parseInt(e.REDIS_MAX_RETRIES ?? String(REDIS_CONSTANTS.DEFAULT_MAX_RETRIES), 10)) 
  ;

  if (e.REDIS_PASSWORD) builder.setPassword(e.REDIS_PASSWORD);
  if (e.REDIS_TLS === 'true') builder.enableTLS();

  return builder.build();
}