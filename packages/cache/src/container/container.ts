import { container, type DependencyContainer } from "tsyringe";
import { REDIS_TOKENS } from "../tokens/redis.token";
import { LuaHandler } from "../luaHandler";
import { RedisClientManager } from "../redis.client";
import { loadRedisConfig } from "../config/config";
import { RedisConfig } from "../types/redis.types";


export function registerRedis(    
    targetContainer: DependencyContainer = container,
    config: RedisConfig,
): void {

    const cfg = loadRedisConfig(config);

    targetContainer.registerInstance<RedisConfig>(REDIS_TOKENS.RedisConfig, cfg);

    targetContainer.registerSingleton(REDIS_TOKENS.RedisClientManager, RedisClientManager);

    targetContainer.registerSingleton(REDIS_TOKENS.LuaHandler, LuaHandler);

}