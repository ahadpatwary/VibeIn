import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from 'src/shared/modules/cache/redis.service';
import { UserCacheRepository } from '../../domain/repositories/user.cache.repository.interface';

@Injectable()
export class RedisUserRepository implements UserCacheRepository {
  constructor(private readonly redisClient: RedisService) { }

  async getUser(id: string): Promise<User | null> {
    const data = await this.redisClient.getClient().get(`user:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async setUser(user: User): Promise<void> {
    await this.redisClient.getClient().set(`user:${user.id}`, JSON.stringify(user));
  }
}
