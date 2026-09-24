import { Inject, Injectable } from '@nestjs/common';
import { CacheRepository } from '../../application/interfaces/cache.interface';
import { RedisService } from '@app/redis-client';
import { USER_TOKENS } from '../../application/tokens/user.token';

@Injectable()
export class RedisUserRepository implements CacheRepository {
  constructor(
    @Inject(USER_TOKENS.RedisService)
    private readonly redisService: RedisService,
  ) {}

  async set(): Promise<void> {
    this.redisService.commandWraper('SET', async (client) => {
      await client.set('name', 'abdule ahad patwary');
    });
  }
}
