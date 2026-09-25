import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';
import { Inject, Injectable } from '@nestjs/common';

import { type CacheRepository } from '../interfaces/cache.interface';
import { type UserRepository } from '../interfaces/user.interface';
import { CreateUserInput } from '../schemas/user.schema';
import { USER_TOKENS } from '../tokens/user.token';

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

      const data = await this.cacheRepository.set();

      this.logger.info(`data: ${data}`);
   }
}
