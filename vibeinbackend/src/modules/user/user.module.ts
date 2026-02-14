import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { MongoUserRepository } from './infrastructure/database/models/user.model';
import { RedisUserCache } from './infrastructure/cache/redis.cache.service';
import { UserRabbitMQProducer } from './infrastructure/queue/user.rabbitmq.producer';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: 'UserRepository', useClass: MongoUserRepository },
    { provide: 'UserCache', useClass: RedisUserCache },
    UserRabbitMQProducer,
  ],
})
export class UserModule {}
