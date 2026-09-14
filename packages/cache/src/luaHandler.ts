import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Redis from "ioredis";

import { RedisClientManager } from "./redis.client";
import { ILogger } from "./utils/logger";
import {
    RedisCommandException,
    RedisConnectionException,
} from "./exceptions/redis.exception";
import { injectable } from "tsyringe";



export const LuaScriptName = {
    LEAKY_BUCKET: "leaky-bucket",
    TOKEN_BUCKET: "token-bucket",
} as const;

export type LuaScriptName =
    (typeof LuaScriptName)[keyof typeof LuaScriptName];

export type ScriptLoaderConfig = {
    name: LuaScriptName;
    path: string;
};

type LoadedLuaScript = {
    source: string;
    sha: string;
    path: string;
};

@injectable()
export class LuaHandler {
    /**
     * Stores loaded Lua scripts.
     *
     * name -> {
     *   source,
     *   sha,
     *   path
     * }
     */
    private readonly _scripts = new Map<
        LuaScriptName,
        LoadedLuaScript
    >();

    /**
     * Prevents multiple concurrent SCRIPT LOAD operations
     * for the same script.
     */
    private readonly _loading = new Map<
        LuaScriptName,
        Promise<LoadedLuaScript>
    >();

    private _initialized = false;

    constructor(
        private readonly redisClient: RedisClientManager,
        private readonly logger: ILogger,
    ) {}


    /**
     * Loads all configured Lua scripts into Redis and
     * stores their source + SHA locally.
     *
     * This should normally be called once during application startup.
     */
    async initialize(
        configs: ScriptLoaderConfig[],
    ): Promise<void> {
        if (this._initialized) {
            return;
        }

        try {
            for (const config of configs) {
                await this.#loadScript(config);
            }

            this._initialized = true;

            this.logger.info?.(
                "Redis Lua scripts initialized successfully",
                {
                    scripts: configs.map((config) => config.name),
                },
            );
        } catch (error) {
            this.logger.error(
                "Failed to initialize Redis Lua scripts",
                {
                    error,
                },
            );

            throw error;
        }
    }


    async execute<T = unknown>(
        name: LuaScriptName,
        keys: string[] = [],
        args: string[] = [],
    ): Promise<T> {
        const script = this._scripts.get(name);

        if (!script) {
            throw new RedisCommandException(
                "LUA",
                new Error(
                    `Lua script "${name}" has not been initialized`,
                ),
                {
                    name,
                    keys,
                    args,
                },
            );
        }

        try {
            const redis = await this.redisClient.getClient();

            const result = await redis.evalsha(
                script.sha,
                keys.length,
                ...keys,
                ...args,
            );

            return result as T;
        } catch (error) {
          
            /** Redis connnection error or execution error */
            if (error instanceof RedisConnectionException) {
                this.logger.error(
                    "Redis connection error while executing Lua script",
                    {
                        error,
                        name,
                    },
                );

                throw error;
            }

            
            /** There are no scriopt in redis server - NOSCRIPT error */
            if (this.#isNoScriptError(error)) {
                return this.#handleNoScript<T>(
                    name,
                    keys,
                    args,
                );
            }


            this.logger.error(
                "Error occurred while executing Lua script",
                {
                    error,
                    name,
                    keys,
                    args,
                },
            );

            /** UNKNOWN error */
            throw new RedisCommandException(
                "LUA",
                this.#toError(error),
                {
                    name,
                    keys,
                    args,
                },
            );
        }
    }

    /** Noscript handler
     * name - name of the script
     * keys - keys to be passed to the script
     * args - arguments to be passed to the script
     */
    async #handleNoScript<T>(
        name: LuaScriptName,
        keys: string[],
        args: string[],
    ): Promise<T> {
        const script = this._scripts.get(name);

        if (!script) {
            throw new RedisCommandException(
                "LUA",
                new Error(
                    `Lua script "${name}" is not registered`,
                ),
                {
                    name,
                    keys,
                    args,
                },
            );
        }

        try {
            const redis = await this.redisClient.getClient();

            /*
             * The script is already available locally.
             *
             * Redis lost its script cache, so execute the
             * source directly using EVAL.
             */
            const result = await redis.eval(
                script.source,
                keys.length,
                ...keys,
                ...args,
            ) as T;

            /*
             * EVAL successfully executed the script.
             *
             * Now restore the script in Redis so subsequent
             * requests can use EVALSHA again.
             */
            await this.#reloadScript(name, script.source); //TODO: why this line needed

            return result;
        } catch (error) {
            if (error instanceof RedisConnectionException) {
                this.logger.error(
                    "Redis connection error while recovering Lua script",
                    {
                        error,
                        name,
                    },
                );

                throw error;
            }

            this.logger.error(
                "Failed to recover Redis Lua script",
                {
                    error,
                    name,
                },
            );

            throw new RedisCommandException(
                "LUA",
                this.#toError(error),
                {
                    name,
                    keys,
                    args,
                },
            );
        }
    }

    /* ---------------------------------------------------------------------- */
    /*                            Load script                                  */
    /* ---------------------------------------------------------------------- */

    async #loadScript(
        config: ScriptLoaderConfig,
    ): Promise<LoadedLuaScript> {
        /*
         * If another request is already loading this script,
         * wait for the same Promise instead of loading it again.
         */
        const existingLoad = this._loading.get(config.name);

        if (existingLoad) {
            return existingLoad;
        }

        const loadPromise = this.#performLoad(config);

        this._loading.set(config.name, loadPromise);

        try {
            return await loadPromise;
        } finally {
            this._loading.delete(config.name);
        }
    }

    async #performLoad(
        config: ScriptLoaderConfig,
    ): Promise<LoadedLuaScript> {
        try {
            const source = await this.#readScript(config.path);

            const redis = await this.redisClient.getClient();

            const sha = await redis.script(
                "LOAD",
                source,
            ) as string;

            const loadedScript: LoadedLuaScript = {
                source,
                sha,
                path: config.path,
            };

            this._scripts.set(
                config.name,
                loadedScript,
            );

            this.logger.info?.(
                "Redis Lua script loaded",
                {
                    name: config.name,
                    sha,
                    path: config.path,
                },
            );

            return loadedScript;
        } catch (error) {
            if (error instanceof RedisConnectionException) {
                this.logger.error(
                    "Redis connection error while loading Lua script",
                    {
                        error,
                        name: config.name,
                    },
                );

                throw error;
            }

            this.logger.error(
                "Error occurred while loading Lua script",
                {
                    error,
                    name: config.name,
                    path: config.path,
                },
            );

            throw new RedisCommandException(
                "LUA",
                this.#toError(error),
                {
                    name: config.name,
                    path: config.path,
                },
            );
        }
    }

    
    /**
     * Reload after NOSCRIPT error.
     * @param name 
     * @param source 
     * @returns 
     */
    async #reloadScript(
        name: LuaScriptName,
        source: string,
    ): Promise<string> {
        /*
         * Multiple requests can receive NOSCRIPT at almost
         * the same time.
         *
         * Instead of every request doing SCRIPT LOAD,
         * reuse the same loading Promise.
         */
        const existingLoad = this._loading.get(name);

        if (existingLoad) {
            const loaded = await existingLoad;
            return loaded.sha;
        }

        const loadPromise = (async () => {
            try {
                const redis = await this.redisClient.getClient();

                const sha = await redis.script(
                    "LOAD",
                    source,
                ) as string;

                const current = this._scripts.get(name);

                if (current) {
                    this._scripts.set(name, {
                        ...current,
                        sha,
                    });
                }

                return {
                    source,
                    sha,
                    path: current?.path ?? "",
                };
            } finally {
                this._loading.delete(name);
            }
        })();

        this._loading.set(name, loadPromise);

        const loaded = await loadPromise;

        return loaded.sha;
    }

    /**
     * script loader
     * @param scriptPath 
     * @returns 
     */
    async #readScript(
        scriptPath: string,
    ): Promise<string> {
        if (!scriptPath?.trim()) {
            throw new Error(
                "Lua script path cannot be empty",
            );
        }

        /*
         * Resolve path relative to the current working directory.
         *
         * If your package requires paths relative to this file,
         * use import.meta.url based resolution instead.
         */
        const absolutePath = path.resolve(
            scriptPath,
        );

        try {
            const source = await fs.readFile(
                absolutePath,
                "utf8",
            );

            if (!source.trim()) {
                throw new Error(
                    `Lua script is empty: ${absolutePath}`,
                );
            }

            return source;
        } catch (error) {
            throw new Error(
                `Failed to read Lua script at ${absolutePath}: ${error}`,
            );
        }
    }

    /**
     * error handler for NOSCRIPT error
     * @param error
     */
    #isNoScriptError(
        error: unknown,
    ): boolean {
        return (
            error instanceof Error &&
            error.message.includes("NOSCRIPT")
        );
    }

    #toError(
        error: unknown,
    ): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error(
            typeof error === "string"
                ? error
                : JSON.stringify(error),
        );
    }

    /**
     * Lifecycle
     */
    get initialized(): boolean {
        return this._initialized;
    }
}

