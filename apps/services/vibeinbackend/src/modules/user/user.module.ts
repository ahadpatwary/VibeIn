import { Module } from '@nestjs/common';

import { UserService } from './application/services/user.service';
import { USER_TOKENS } from './application/tokens/user.token';
import { RedisUserRepository } from './infrastructure/cache/redis-user.repository';
import { UserController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/persistence/user.repository';

@Module({
   controllers: [UserController],

   providers: [
      UserService,

      {
         provide: USER_TOKENS.MongoUserRepository,
         useClass: UserRepository,
      },

      {
         provide: USER_TOKENS.CacheUserRepository,
         useClass: RedisUserRepository,
      },
   ],

   exports: [UserService],
})
export class UserModule {}
