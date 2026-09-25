import { Module } from '@nestjs/common';

import { UserService } from './application/services/user.service';
import { USER_TOKENS } from './application/tokens/user.token';
import { RedisUserRepository } from './infrastructure/cache/redis-user.repository';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { UserController } from './presentation/controllers/user.controller';

@Module({
   controllers: [UserController],

   providers: [
      UserService,

      {
         provide: USER_TOKENS.MongoUserRepository,
         useClass: MongoUserRepository,
      },

      {
         provide: USER_TOKENS.CacheUserRepository,
         useClass: RedisUserRepository,
      },
   ],

   exports: [UserService],
})
export class UserModule {}
