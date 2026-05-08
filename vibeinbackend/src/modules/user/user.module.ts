import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { RedisModule } from 'src/shared/modules/cache/redis.module';
import { User } from './domain/entities/user.entity';
import { CACHE_REPOSITORY, PERSISTENCE_REPOSITORY, QUEUE_REPOSITORY } from 'src/shared/tokens/token';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user.repository';
import { RedisUserRepository } from './infrastructure/cache/redis-user.repository';
import { UserSchema } from './infrastructure/persistence/schemas/user.schema';
import { UserRabbitMQProducer } from './infrastructure/queue/rabbitmq-user.repository';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: PERSISTENCE_REPOSITORY, useClass: MongoUserRepository },
    { provide: CACHE_REPOSITORY, useClass: RedisUserRepository },
    // { provide: QUEUE_REPOSITORY, useClass: UserRabbitMQProducer}
  ],
  exports: [UserService],
})
export class UserModule {}