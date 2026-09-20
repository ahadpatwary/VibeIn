import { ILogger, LoggerFactory } from "@app/logger";
import {
    LuaHandler, 
    RedisCommandException, 
    RedisService, 
    ScriptLoaderConfig 
} from "@app/redis-client";
import {
    BLACKLIST_KEY, 
    PENALTY_KEY_PREFIX, 
    PENALTY_TIERS, 
    WHITELIST_KEY 
} from "../constants/constant";
import { inject, injectable } from "tsyringe";
import { RATE_LIMIT_TOKENS } from "../token/token";
import { BanStatus, ViolationStatus } from "../types/types";



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

        const LUA_RESET_BLOCK = `
            local pattern = ARGV[1]
            
            local keys = redis.call('KEYS', pattern)

            if #keys > 0 then
                redis.call('DEL', unpack(keys))
            end

            redis.call('DEL', KEYS[1], KEYS[2])

            return #keys
        `

        await this.redisService.commandWraper('EVAL', async (client) => {
            client.eval(
                LUA_RESET_BLOCK,
                2,
                `${PENALTY_KEY_PREFIX}:violations:${identifier}`,
                `${PENALTY_KEY_PREFIX}:ban:${identifier}`,
                pattern,
            )
        })
    }

    async isWhitelisted(id: string): Promise<boolean> {
 
        const { results, errors } = await this.redisService.pipeline((pipe) => {
            pipe.sismember(WHITELIST_KEY, id);
            pipe.exists(`${WHITELIST_KEY}:${id}`);
        })

        if (errors.length > 0) {
            throw new RedisCommandException('PIPELINE', errors[0]);
        }
        
        const inSet = results[0]?.[1];
        const withTTL = results[1]?.[1];

        return inSet === 1 || withTTL === 1;

    }

    async isBlacklisted(id: string): Promise<boolean> {

        const { results, errors } = await this.redisService.pipeline((pipe) => {
            pipe.sismember(BLACKLIST_KEY, id);
            pipe.exists(`${BLACKLIST_KEY}:${id}`);
        })

        if (errors.length > 0) {
            throw new RedisCommandException('PIPELINE', errors[0]);
        }
        
        const inSet = results[0]?.[1];
        const withTTL = results[1]?.[1];

        return inSet === 1 || withTTL === 1;
    }

    async checkBan(namespacedId: string): Promise<BanStatus> {
        const banKey = `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`;
        const ttl = await this.redisService.commandWraper<number>('TTL', async (client) => {
            return client.ttl(banKey);
        })
        return { banned: ttl > 0, ttl };
    }

    async incrementViolation(namespacedId: string, penaltyThreshold: number): Promise<void> {
        const violKey = `${PENALTY_KEY_PREFIX}:violations:${namespacedId}`;
        const banKey = `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`;

        this.luaExecute(
            'panaly-check', 
            [violKey, banKey], 
            [
                String(penaltyThreshold),
                String(86400 * 7),
                ...PENALTY_TIERS.map(String),
            ]
        )
    }

    /**
     * Get current violation + ban status for an identifier
     */
    async getStatus(
        identifier: string,
        keyspace: string | null = null,
    ): Promise<ViolationStatus> {
        const namespacedId = keyspace
            ? `${keyspace}:${identifier}`
            : identifier;

        const { results, errors } = await this.redisService.pipeline((pipe) => {
            pipe.get(
                `${PENALTY_KEY_PREFIX}:violations:${namespacedId}`,
            );

            pipe.ttl(
                `${PENALTY_KEY_PREFIX}:ban:${namespacedId}`,
            );

            pipe.sismember(WHITELIST_KEY, namespacedId);
            pipe.exists(`${WHITELIST_KEY}:${namespacedId}`);

            pipe.sismember(BLACKLIST_KEY, namespacedId);
            pipe.exists(`${BLACKLIST_KEY}:${namespacedId}`);
        });

        if (errors.length > 0) {
            throw new RedisCommandException('PIPELINE', errors[0]);
        }

        const violations = Number(results[0]?.[1] ?? 0);
        const banTTL = Number(results[1]?.[1] ?? -2);

        const whitelistInSet = results[2]?.[1];
        const whitelistWithTTL = results[3]?.[1];

        const blacklistInSet = results[4]?.[1];
        const blacklistWithTTL = results[5]?.[1];

        const whitelisted =
            whitelistInSet === 1 || whitelistWithTTL === 1;

        const blacklisted =
            blacklistInSet === 1 || blacklistWithTTL === 1;

        return {
            identifier,
            violations,
            banned: banTTL > 0,
            banTTL: banTTL > 0 ? banTTL : 0,
            whitelisted,
            blacklisted,
        };
    }
}