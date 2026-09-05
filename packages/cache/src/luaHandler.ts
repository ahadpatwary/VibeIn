import Redis from "ioredis";
import { RedisClientManager } from "./redis.client";
import { ILogger } from "./utils/logger";
import { RedisCommandException, RedisConnectionException } from "./exceptions/redis.exception";


export type LuaScriptName = {
    LEAKY_BUCKET: 'leaky-bucket',
    TOKEN_BUCKET: 'token-bucket',
}

export class LuaHandler {
    private _shas = new Map<LuaScriptName, string>(); 

    constructor(
        private readonly redisClient: RedisClientManager,
        private readonly logger: ILogger, //TODO: this line have to change the type
    ) {}

    async initialize(): Promise<void> {
     
        try {
            const redis = await this.redisClient.getClient();

            // for(const name of Object.values(LuaScriptName)) {
            //     const source = this.getLuaScriptSource(name);
            //     await this.loadLuaScript(redis, name, source);
            // }

        } catch (error) {
            this.logger.error("Error occurred while loading Lua script", { error });
        }


        // this._shas.set(name, sha);
    }

    // private getLuaScriptSource(name: LuaScriptName): string {

    async execute<T = unknown>(
        name: LuaScriptName,
        keys: string[] = [],
        args: string[] = []
    ): Promise<T> {

        // const sourch = LuaScript[name];
        let sha = this._shas.get(name);

        if (!sha) {
            // sha = await this.#load(name, this.getLuaScriptSource(name));
        }

        try {
            const redis: Redis = await this.redisClient.getClient();

            const result = await redis.evalsha(
                sha!, //TODO:
                keys.length,
                ...keys,
                ...args
            ) as T;

            return result as T;

        } catch (error) {

            if(error instanceof RedisConnectionException) {
                this.logger.error("Redis connection error occurred while executing Lua script", { error });
                throw error;
            }

            if(error instanceof Error && error.message.includes('NOSCRIPT')) {
                const script = "script" //TODO: script define
                this.#noScriptHandler(name, script, keys, args);
            }

            this.logger.error("Error occurred while executing Lua script", { error });

            throw new RedisCommandException("LUA", error as Error, { name, keys, args });
        
        }
    }

    async #noScriptHandler<T>(
        name: LuaScriptName,
        script: string,
        keys: string[] = [],
        args: string[] = []
    ): Promise<T> {
        try {
            const redis = await this.redisClient.getClient();

            const result = await redis.eval(
                script,
                keys.length,
                ...keys,
                ...args
            ) as T;

            this.#load(name, script);
            return result as T;
        } catch (error) {
            if(error instanceof RedisConnectionException) {
                this.logger.error("Redis connection error occurred while executing Lua script", { error });
                throw error;
            }

            this.logger.error("Error occurred while executing Lua script", { error });
            throw new RedisCommandException("LUA", error as Error, { name, keys, args });
        }
    }

    async #load(
        name: LuaScriptName,
        source: string
    ): Promise<string> {
        try {
            const redis = await this.redisClient.getClient();
            const sha = await redis.script('LOAD', source) as string;
            this._shas.set(name, sha);
            return sha;
        } catch (error) {
            if(error instanceof RedisConnectionException) {
                this.logger.error("Redis connection error occurred while loading Lua script", { error });
                throw error;
            }

            this.logger.error("Error occurred while loading Lua script", { error });
            throw new RedisCommandException("LUA", error as Error , { name, source });
        }
    }

}