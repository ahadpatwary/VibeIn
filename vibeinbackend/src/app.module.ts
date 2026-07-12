import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMqModule } from './shared/modules/queue/rabbitmq.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './shared/config/env.validation';
import configuration from './shared/config/configuration';
import { StorageModule } from './modules/storage/storage.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { RedisModule } from './infrastructure/cache/redis.module';
import { RedisConfig } from './infrastructure/cache';
import { DatabaseConfig } from './infrastructure/database/types/database.type';
// import { FeedPostModule } from './modules/feed/post/post.module';



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

    DatabaseModule.forRootAsync({
      useFactory: (config: ConfigService): DatabaseConfig => ({
        uri: config.get<string>('uri')!,
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

    RedisModule.forRoot({
      useFactory:(config: ConfigService): RedisConfig => ({
        host: config.get<string>('host')!,
        port: Number(config.get<string>('port'))!,
        commandTimeout: 3000,
        // db: config.get<string>('redisDbName')!,
        keepAlive: 10,
        keyPrefix: 'vibein',
        password: config.get<string>('password'),
      }),
      inject: [ConfigService]
    }),

    UserModule,
    StorageModule,
    // FeedPostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}