import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';

import { RedisModule } from 'src/shared/modules/cache/redis.module';
import { RedisService } from 'src/shared/modules/cache/redis.service';

import { User } from './domain/entities/user.entity';
import {
  CACHE_REPOSITORY,
  PERSISTENCE_REPOSITORY,
} from 'src/shared/tokens/token';

import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { RedisUserRepository } from './infrastructure/cache/redis-user.repository';
import { UserSchema } from './infrastructure/persistence/schemas/user.schema';

import { createBloomFilter } from 'src/shared/bloom-filter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    RedisModule,
  ],

  controllers: [UserController],

  providers: [
    UserService,

    {
      provide: PERSISTENCE_REPOSITORY,
      useClass: MongoUserRepository,
    },

    {
      provide: CACHE_REPOSITORY,
      useClass: RedisUserRepository,
    },

    {
      provide: 'BLOOM_FILTER',
      inject: [RedisService],
      useFactory: async (redisService: RedisService) => {
        const redis = redisService.getClient()!;
        return createBloomFilter(redis, {
          key: 'username'
        });
      },
    },
  ],

  exports: [UserService, 'BLOOM_FILTER'],
})
export class UserModule {}