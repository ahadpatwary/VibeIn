import { ILogger, LoggerFactory } from "@app/logger";
import { LuaHandler, RedisService, ScriptLoaderConfig } from "@app/redis-client";
import { inject, injectable } from "tsyringe";
import { RATE_LIMIT_TOKENS } from "../token/token";
import { FixedWindowCounter } from "../../../../outside/algorithms/fixed-window";
import { SlidingWindowCounter } from "../../../../outside/algorithms/sliding-window";
import { TokenBucket } from "../../../../outside/algorithms/token-bucket";
import { LeakyBucket } from "../../../../outside/algorithms/leaky-bucket";
import { IAlgorithmEngine, RateLimitAlgorithm } from "../types/types";


const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'sliding-window';
const PENALTY_KEY_PREFIX = 'rl:penalty';
const BLACKLIST_KEY = 'rl:blacklist';
const WHITELIST_KEY = 'rl:whitelist';

// Penalty: exponential backoff ban durations (seconds)
const PENALTY_TIERS: readonly number[] = [60, 300, 1800, 86400]; // 1m, 5m, 30m, 24h

@injectable()
export class StoreService {
    private readonly logger: ILogger;

    constructor(
        @inject(RATE_LIMIT_TOKENS.RedisService)
        private readonly redisService: RedisService,

        @inject(RATE_LIMIT_TOKENS.LuaHandler)
        private readonly luaHandler: LuaHandler,

        @inject(RATE_LIMIT_TOKENS.Logger) factory: LoggerFactory,
    ){
        this.logger = factory.forModule('RATE_LIMIT_MODULE');
    }


    /**
     * All lua code store on redis server 
     */
    async init(luaConfig: ScriptLoaderConfig[]): Promise<void> {
        await this.luaHandler.initialize(luaConfig)
    }

    /**
     * Execute lua operation
     * @param name 
     * @param keys 
     * @param args 
     * @returns 
     */
    async luaExecute<T>(name: string, keys?: string[], args?: string[]): Promise<T> {
        return this.luaHandler.execute<T>(name, keys, args);
    }

    /**
    * Add identifier to whitelist (bypass all rate limits)
    */
    async whitelist(identifier: string, ttlSecs: number | null = null): Promise<void> {
        if (ttlSecs) {
            this.redisService.commandWraper('SET', async (client) => {
                client.set(`${WHITELIST_KEY}:${identifier}`, '1', 'EX', ttlSecs)
            } )
        } else {
            this.redisService.commandWraper('SADD', async (client) => {
                client.sadd(WHITELIST_KEY, identifier);
            })
        }
    }

    /**
    * Remove identifier from whitelist
    */
    async unwhitelist(identifier: string): Promise<void> {
        await Promise.all([
            this.redisService.commandWraper('CUSTOM', async (client) => {
                client.srem(WHITELIST_KEY, identifier);
                client.del(`${WHITELIST_KEY}:${identifier}`);
            })
        ]);
    }


    /**
    * Permanently block an identifier
    */
    async blacklist(identifier: string, ttlSecs: number | null = null): Promise<void> {
        if (ttlSecs) {
            this.redisService.commandWraper('SET', async (client) => {
                client.set(`${BLACKLIST_KEY}:${identifier}`, '1', 'EX', ttlSecs);
            })
        } else {
            this.redisService.commandWraper('SADD', async (client) => {
                client.sadd(BLACKLIST_KEY, identifier);
            })
        }
    }

    /**
    * Remove identifier from blacklist
    */
    async unblacklist(identifier: string): Promise<void> {
        await Promise.all([
            this.redisService.commandWraper('CUSTOM', async (client) => {
                client.srem(BLACKLIST_KEY, identifier),
                client.del(`${BLACKLIST_KEY}:${identifier}`)
            })
        ]);
    }

    /**
    * Reset all rate limit counters for an identifier + keyspace
    */
    async reset(identifier: string, keyspace: string | null = null): Promise<void> {
        const pattern = keyspace
        ? `rl:*:${keyspace}:${identifier}:*`
        : `rl:*:${identifier}:*`;

        //TODO: total query same lua script
        // const keys = await this._redis.keys(pattern);
        // if (keys.length) await this._redis.del(...keys);

        // // Also clear penalties
        // await this._redis.del(
        //     `${PENALTY_KEY_PREFIX}:violations:${identifier}`,
        //     `${PENALTY_KEY_PREFIX}:ban:${identifier}`
        // );
    }

    async isWhitelisted(id: string): Promise<boolean> {
        const [inSet, withTTL] = await Promise.all([
            this._redis.sismember(WHITELIST_KEY, id),
            this._redis.exists(`${WHITELIST_KEY}:${id}`),
        ]);
        return inSet === 1 || withTTL === 1;
    }

    async isBlacklisted(id: string): Promise<boolean> {
        const [inSet, withTTL] = await Promise.all([
            this._redis.sismember(BLACKLIST_KEY, id),
            this._redis.exists(`${BLACKLIST_KEY}:${id}`),
        ]);
        return inSet === 1 || withTTL === 1;
    }

    async checkBan(namespacedId: string): Promise<BanStatus> {
        const banKey = `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`;
        const ttl = await this._redis.ttl(banKey);
        return { banned: ttl > 0, ttl };
    }



}