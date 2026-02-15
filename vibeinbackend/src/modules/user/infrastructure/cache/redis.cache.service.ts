import { Injectable } from '@nestjs/common';
import { UserCache } from './redis.cache.interface';
import { User } from '../../domain/entities/user.entity';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisUserCache implements UserCache {
  constructor(private readonly redisClient: RedisClientType) { }

  async getUser(id: string): Promise<User | null> {
    const data = await this.redisClient.get(`user:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async setUser(user: User): Promise<void> {
    await this.redisClient.set(`user:${user.id}`, JSON.stringify(user));
  }
}
