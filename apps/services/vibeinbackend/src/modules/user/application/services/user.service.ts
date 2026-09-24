import { Inject, Injectable } from '@nestjs/common';
import { type UserRepository } from '../interfaces/user.interface';
import { USER_TOKENS } from '../tokens/user.token';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';
import { CreateUserInput } from '../schemas/user.schema';
import { type CacheRepository } from '../interfaces/cache.interface';

@Injectable()
export class UserService {
  private readonly logger: ILogger;

  constructor(
    @Inject(USER_TOKENS.MongoUserRepository)
    private readonly userRepository: UserRepository,

    @Inject(USER_TOKENS.CacheUserRepository)
    private readonly cacheRepository: CacheRepository,

    @Inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
  ) {
    this.logger = factory.forModule('USER_MODULE');
  }

  async createUser(userInput: CreateUserInput): Promise<void> {
    await this.userRepository.createUser(userInput);

    const data = this.cacheRepository.set();

    this.logger.info(`data: ${data}`);
  }
}
