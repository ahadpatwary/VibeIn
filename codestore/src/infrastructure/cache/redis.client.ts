import Redis, { RedisOptions } from 'ioredis';
import { RedisConfig } from './types/redis.types';
import { REDIS_EVENTS } from './constants/redis.constants';
import { RedisConnectionException } from './exceptions/redis.exception';
import { Logger, RedisLogger } from './utils/redis.logger';

export class RedisClient {
  private client: Redis | null = null;
  private readonly logger: Logger;
  private isConnected = false;

  constructor(
    private readonly config: RedisConfig,
    logger?: Logger,
  ) {
    this.logger = logger ?? new RedisLogger();
  }

  /**
   * Connect to Redis and return the client instance.
   */
  async connect(): Promise<Redis> {
    if (this.client && this.isConnected) {
      return this.client;
    }

    const options: RedisOptions = {
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      keyPrefix: this.config.keyPrefix,
      connectTimeout: this.config.connectTimeout,
      commandTimeout: this.config.commandTimeout,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      enableReadyCheck: this.config.enableReadyCheck ?? true,
      lazyConnect: this.config.lazyConnect ?? true,
      keepAlive: this.config.keepAlive,
      family: this.config.family,
      retryStrategy: this.config.retryStrategy ?? this.defaultRetryStrategy.bind(this),
      ...(this.config.tls ? { tls: {} } : {}),
    };

    this.client = new Redis(options);
    this.registerEventHandlers(this.client);

    try {
      await this.client.connect();
      this.isConnected = true;
      this.logger.info('Redis connected successfully', {
        host: this.config.host,
        port: this.config.port,
        db: this.config.db,
      });
      return this.client;
    } catch (err) {
      this.isConnected = false;
      throw new RedisConnectionException(err as Error, {
        host: this.config.host,
        port: this.config.port,
      });
    }
  }

  /**
   * Disconnect from Redis gracefully.
   */
  async disconnect(): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.quit();
      this.isConnected = false;
      this.logger.info('Redis disconnected gracefully');
    } catch {
      this.client.disconnect();
      this.isConnected = false;
      this.logger.warn('Redis disconnected forcefully');
    } finally {
      this.client = null;
    }
  }

  /**
   * Get the ioredis client. Throws if not initialized.
   */
  getClient(): Redis {
    if (!this.client) {
      throw new RedisConnectionException(
        new Error('Redis client not initialized. Call connect() first.'),
      );
    }
    return this.client;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  private defaultRetryStrategy(times: number): number | null {
    if (times > 10) {
      this.logger.error('Redis max reconnection attempts reached. Giving up.');
      return null;
    }
    const delay = Math.min(times * 100, 3000);
    this.logger.warn(`Redis reconnecting in ${delay}ms...`, { attempt: times });
    return delay;
  }

  private registerEventHandlers(client: Redis): void {
    client.on(REDIS_EVENTS.CONNECT, () => {
      this.isConnected = true;
      this.logger.info('Redis connection established');
    });

    client.on(REDIS_EVENTS.READY, () => {
      this.logger.info('Redis client is ready');
    });

    client.on(REDIS_EVENTS.ERROR, (err: Error) => {
      this.logger.error('Redis error', { error: err.message });
    });

    client.on(REDIS_EVENTS.CLOSE, () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    client.on(REDIS_EVENTS.RECONNECTING, () => {
      this.logger.info('Redis reconnecting...');
    });

    client.on(REDIS_EVENTS.END, () => {
      this.isConnected = false;
      this.logger.warn('Redis connection ended');
    });
  }
}