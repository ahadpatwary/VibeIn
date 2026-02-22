import { Inject, Injectable } from '@nestjs/common';
import type { UserPersistenceRepository } from '../../domain/repositories/user.persistence.repository.interface';
import { CACHE_REPOSITORY, PERSISTENCE_REPOSITORY, QUEUE_REPOSITORY } from 'src/shared/tokens/token';
import type { UserCacheRepository } from '../../domain/repositories/user.cache.repository.interface';
import type { UserQueueRepository } from '../../domain/repositories/user.queue.repository.interface';
import { CreateUserDto } from '../dto/user.dto';
import { User } from '../../domain/entities/user.entity';


@Injectable()
export class UserService {
  constructor(
    @Inject(PERSISTENCE_REPOSITORY)
    private readonly userPersistence: UserPersistenceRepository,

    @Inject(CACHE_REPOSITORY)
    private readonly userCache: UserCacheRepository,

    // @Inject(QUEUE_REPOSITORY)
    // private readonly userQueue: UserQueueRepository,
  ) {}

  async getUser(id: string): Promise<User | null> {
    let user = await this.userCache.getUser(id);
    if (!user) {
      user = await this.userPersistence.findById(id);
      if (user) await this.userCache.setUser(user);
    }
    return user;
  }

  async createUser(CreateUserBody: CreateUserDto){
    // const user = new User(Date.now().toString(), dto.name, dto.email);
    const saved = await this.userPersistence.create(CreateUserBody);
    await this.userCache.setUser(saved);
    // await this.userQueue.publishUserCreated(saved);
    return saved;
  }

  async updateUser(id: string, body: CreateUserDto) {
    return this.userPersistence.update(id, body);
  }

  async deleteUser(id: string) {
    return this.userPersistence.delete(id);
  }

  // async searchUser(name: string) {
  //   this.userRepo.searchUserFromFriendlist('12345', 'abdul ahad patwary');
  //   this.userRepo.searchUserFromMutualFriendlist('12345', 'abdul ahad patwary');
  //   this.userRepo.searchUserFromGlobally('12345', 'abdul ahad patwary');
  // }
}
