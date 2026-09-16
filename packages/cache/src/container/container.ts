import { container, type DependencyContainer } from "tsyringe";
import { REDIS_TOKENS } from "../tokens/redis.token";
import { LoggerConfig, registerLogger } from "@app/logger";
import { LuaHandler } from "../luaHandler";
import { RedisClientManager } from "../redis.client";
import { loadRedisConfig } from "../config/config";
import { RedisConfig } from "../types/redis.types";


export function registerRedis(    
    targetContainer: DependencyContainer = container,
    config?: RedisConfig,
    loggerConfig?: LoggerConfig,
): void {

    
    const cfg = config ?? loadRedisConfig();

    targetContainer.registerInstance<RedisConfig>(REDIS_TOKENS.RedisConfig, cfg);

    targetContainer.registerSingleton(REDIS_TOKENS.RedisClientManager, RedisClientManager);

    targetContainer.registerSingleton(REDIS_TOKENS.LuaHandler, LuaHandler);

    registerLogger();

}

// this.logger = factory.forModule('RedisModule');