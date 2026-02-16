import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './application/user.service';
import { UserController } from './presentation/controllers/user.controller';

import { MongoUserRepository } from './infrastructure/database/models/user.model';
import { RedisUserCache } from './infrastructure/cache/redis.cache.service';

import { UserDocument, UserSchema } from './infrastructure/database/user.mongo.schema';
import { UserRepository } from './domain/repositories/user.repository.interface';
import { UserCache } from './infrastructure/cache/redis.cache.interface';
import { UserRabbitMQProducer } from './infrastructure/queue/user.rabbitmq.producer';
import { RedisModule } from 'src/shared/modules/cache/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    RedisModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: MongoUserRepository },
    { provide: UserCache, useClass: RedisUserCache },
    UserRabbitMQProducer, 
  ],
  exports: [UserService],
})
export class UserModule {}
