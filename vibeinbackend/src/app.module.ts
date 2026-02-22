import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from './shared/modules/queue/rabbitmq.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './shared/config/env.validation';
import configuration from './shared/config/configuration';
import { RedisModule } from './shared/modules/cache/redis.module';
import { StorageModule } from './modules/storage/storage.module';
import { FeedPostModule } from './modules/feed/post/post.module';



@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validate,
      envFilePath: ['.env']
    }),

    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        retryAttempts: 6,
        retryDelay: 1 * 60 * 1000,
      }),
      inject: [ConfigService]
    }),

    RabbitMqModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('queue.uri')!,
        retryAttempts: 6,
        retryDelay: 1 * 60 * 1000,
      }),
      inject: [ConfigService]
    }),

    RedisModule.forRootAsync({
      useFactory:(config: ConfigService) => ({
        uri: config.get<string>('cache.uri')!,
        retryAttempts: 6,
        retryDelay: 1 * 60 * 100,
      }),
      inject: [ConfigService]
    }),

    UserModule,
    StorageModule,
    FeedPostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}


    // RabbitMqModule.forRoot("amqps://dbrcljhf:03DnYhP9lGtrOwhNHHj-yuo4D-KQwytB@shark.rmq.cloudamqp.com/dbrcljhf", {
    //   retryAttempts: 5,
    //   retryDelay: 1 * 60 * 1000
    // }),

    //     MongooseModule.forRoot(MONGODB_URI, {
    //   retryAttempts: 5,
    //   retryDelay: 1 * 60 * 1000,
    // }),