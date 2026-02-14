import { Injectable } from '@nestjs/common';
import { UserRepository } from '../domain/repositories/user.repository.interface';
import { User } from '../domain/entities/user.entity';
import { UserCache } from '../infrastructure/cache/redis.cache.interface';
import { UserRabbitMQProducer } from '../infrastructure/queue/user.rabbitmq.producer';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userCache: UserCache,
    private readonly userQueue: UserRabbitMQProducer
  ) {}

  async getUser(id: string): Promise<User | null> {
    let user = await this.userCache.getUser(id);
    if (!user) {
      user = await this.userRepo.findById(id);
      if (user) await this.userCache.setUser(user);
    }
    return user;
  }

  async createUser(dto: { name: string; email: string }): Promise<User> {
    const user = new User(Date.now().toString(), dto.name, dto.email);
    const saved = await this.userRepo.create(user);
    await this.userCache.setUser(saved);
    await this.userQueue.publishUserCreated(saved);
    return saved;
  }
}
