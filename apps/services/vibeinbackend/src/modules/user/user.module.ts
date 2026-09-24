import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { USER_TOKENS } from './application/tokens/user.token';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { RedisUserRepository } from './infrastructure/cache/redis-user.repository';


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