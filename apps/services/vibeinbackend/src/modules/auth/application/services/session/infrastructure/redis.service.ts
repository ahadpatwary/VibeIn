import { REDIS_TOKENS, RedisService } from '@app/redis-client';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
   constructor(
      @Inject(REDIS_TOKENS.RedisService)
      private readonly redisService: RedisService,
   ) {}

   async createSession(
      hashKey: string,
      data: string,
      setKey: string,
      sessionId: string,
      ttlSession: number,
   ): Promise<void> {
      const { errors } = await this.redisService.transaction((pipe) => {
         pipe.hset(hashKey, data);
         pipe.sadd(setKey, sessionId);
         pipe.expire(hashKey, ttlSession);
         pipe.expire(setKey, ttlSession);
      });

      if (errors.length > 0) throw new Error('session creation fail. Try Again!');
   }

   async revokeSingleSession(
      hashKey: string,
      setKey: string,
      sessionId: string,
      reason: string,
   ): Promise<void> {
      const { errors } = await this.redisService.transaction((pipe) => {
         pipe.srem(setKey, sessionId);
         pipe.hset(hashKey, { status: 'REVOKED', reason });
      });

      if (errors.length > 0)
         throw new Error(`revoke session can't be completed. Please try again!`);
   }

   async revokeAllSessions(setKey: string, reason: string, userId: string): Promise<number> {
      const LUA_REVOKE_ALL_SESSIONS = ``;
      const revokedCount = await this.redisService.commandWraper<number>(
         'EVAL',
         async (client): Promise<number> => {
            return (await client.eval(
               LUA_REVOKE_ALL_SESSIONS,
               1,
               setKey,
               reason,
               userId,
            )) as number;
         },
      );

      return revokedCount;
   }
}
