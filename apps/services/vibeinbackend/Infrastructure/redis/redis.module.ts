import { 
    LuaHandler, 
    REDIS_TOKENS, 
    RedisClientManager, 
    RedisService, 
    registerRedis 
} from "@app/redis-client";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { container } from "tsyringe";

const REDIS_INITIALIZED = Symbol('REDIS_INITIALIZED');

@Module({})
export class RedisModule {

    static forRootAsync(): DynamicModule {
        return {
            module: RedisModule,

            imports: [ ConfigModule ],

            providers: [
                {
                    provide: REDIS_INITIALIZED,
                    inject: [ConfigService],

                    useFactory: (config: ConfigService) => {

     
                        registerRedis(container, {
                            host: config.get<string>('cache.host')!,
                            port: Number(config.get<number>('cache.port'))!,
                            username: config.get<string>('cache.username'),
                            password: config.get<string>('cache.password'),
                            tls: {
                                rejectUnauthorized: false,
                            }
                        })

                        return true;
                    },
                },

                {
                    provide: REDIS_TOKENS.RedisClientManager,
                    /** redis client depend on redis initializer */
                    inject: [REDIS_INITIALIZED],
                    useFactory: () =>
                        container.resolve(RedisClientManager)
                    ,
                },
                
                {
                    provide: REDIS_TOKENS.LuaHandler,
                    /** lua handler depend on redis initializer */
                    inject: [REDIS_INITIALIZED],
                    useFactory: () => 
                        container.resolve(LuaHandler)
                    ,
                    
                },

                {
                    provide: REDIS_TOKENS.RedisService,
                    /** redis service depend on redis initializer */
                    inject: [REDIS_INITIALIZED],
                    useFactory: () => 
                        container.resolve(RedisService)
                    ,
                }

            ],

            global: true,

            exports: [
                REDIS_TOKENS.RedisClientManager,
                REDIS_TOKENS.LuaHandler,
                REDIS_TOKENS.RedisService,
            ],
        };
    }
}