import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';
import { LuaHandler, REDIS_TOKENS, RedisService, ScriptLoaderConfig } from '@app/redis-client';
import { inject, injectable } from 'tsyringe';

import { CooldownData } from '../../types/type';

@injectable()
export class StoreService {
   private readonly logger: ILogger;

   constructor(
      @inject(REDIS_TOKENS.RedisService)
      private readonly redisService: RedisService,

      @inject(REDIS_TOKENS.LuaHandler)
      private readonly luaHandler: LuaHandler,

      @inject(LOGGER_TOKENS.Logger) factory: LoggerFactory,
   ) {
      this.logger = factory.forModule('RATE_LIMIT_MODULE');
   }

   /** All lua code store on redis servece */
   async init(luaConfig: ScriptLoaderConfig[]): Promise<void> {
      await this.luaHandler.initialize(luaConfig);
   }

   /**
    * Execute lua operation
    * @param name
    * @param keys
    * @param args
    * @returns
    */
   async luaExecute<T>(name: string, keys?: string[], args?: string[]): Promise<T> {
      return await this.luaHandler.execute<T>(name, keys, args);
   }

   async cooldownData(key: string): Promise<CooldownData | null> {
      const data = await this.redisService.commandWraper('GET', async (client) => {
         return client.get(key);
      });

      if (!data) return null;

      return JSON.parse(data) as CooldownData;
   }

   async lockAquireAndGetOtp<T>(
      lockKey: string,
      lockToken: string,
      LOCK_TTL_SECONDS: number,
      otpKey: string,
   ): Promise<T> {
      const { results, errors } = await this.redisService.transaction((pipe) => {
         pipe.set(lockKey, lockToken, 'EX', LOCK_TTL_SECONDS, 'NX');
         pipe.get(otpKey);
      });

      if (errors.length > 0) {
         throw new Error(`failed get otp error: ${errors[0]}`);
      }

      if (results[0]?.[1] !== 'OK') throw new Error('Data currect error');
      if (!results[1]?.[1]) throw new Error('otp dose not get successfully');

      const data: T = JSON.parse(results[1][1] as string);

      if (!data) return null as T;

      return data;
   }

   async attemptIncress(
      otpKey: string,
      jsonStirng: string,
      remainingTtlSeconds: number,
   ): Promise<void> {
      await this.redisService.commandWraper('SET', async (client) => {
         client.set(otpKey, jsonStirng, 'EX', remainingTtlSeconds);
      });
   }

   async deleteKey(key: string): Promise<void> {
      await this.redisService.commandWraper('DEL', async (client) => {
         client.del(key);
      });
   }

   async deleteOtpAndSetVerifyToken(
      otpKey: string,
      verifyKey: string,
      verifyToken: string,
      verifyTokenTtl: number,
   ): Promise<void> {
      await this.redisService.transaction((pipe) => {
         pipe.del(otpKey);
         pipe.set(verifyKey, verifyToken, 'EX', verifyTokenTtl);
      });
   }

   async releaseLock(lockKey: string, lockToken: string): Promise<void> {
      const RELEASE_LOCK_SCRIPT = `
         if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
         else
            return 0
         end
      `;

      await this.redisService.commandWraper('EVAL', async (client) => {
         client.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, lockToken);
      });
   }

   async deviceVerified(key: string, token: string): Promise<boolean> {
      const TOKEN_VERIFY_SCRIPT = `
         local key = KEYS[1]
         local token = ARGV[1]

         local stored = redis.call('GET', key)

         if not stored or stored ~= token then
            return false
         end

         redis.call('DEL', key)

         return true
      `;

      return await this.redisService.commandWraper('EVAL', async (client): Promise<boolean> => {
         return client.eval(TOKEN_VERIFY_SCRIPT, 1, key, token) as Promise<boolean>;
      });
   }
}
