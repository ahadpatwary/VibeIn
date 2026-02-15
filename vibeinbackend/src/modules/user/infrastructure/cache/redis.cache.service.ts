import { Injectable } from '@nestjs/common';
import { UserCache } from './redis.cache.interface';
import { User } from '../../domain/entities/user.entity';
import { RedisService } from 'src/shared/modules/cache/redis.service';

@Injectable()
export class RedisUserCache implements UserCache {
  constructor(private readonly redisClient: RedisService) { }

  async getUser(id: string): Promise<User | null> {
    const data = await this.redisClient.RedisClient().get(`user:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async setUser(user: User): Promise<void> {
    await this.redisClient.RedisClient().set(`user:${user.id}`, JSON.stringify(user));
  }
}
