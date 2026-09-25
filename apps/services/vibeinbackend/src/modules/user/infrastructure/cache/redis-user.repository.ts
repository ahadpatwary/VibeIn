import { RedisService } from '@app/redis-client';
import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';

import { CacheRepository } from '../../application/interfaces/cache.interface';
import { USER_TOKENS } from '../../application/tokens/user.token';

@Injectable()
export class RedisUserRepository implements CacheRepository {
   constructor(
      @Inject(USER_TOKENS.RedisService)
      private readonly redisService: RedisService,
   ) {}

   async set(): Promise<string> {
      return await this.redisService.commandWraper<string>(
         'SET',
         async (client: Redis): Promise<string> => {
            return await client.set('name', 'abdule ahad patwary');
         },
      );
   }
}
