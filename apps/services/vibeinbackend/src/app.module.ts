import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './shared/config/env.validation';
import configuration from './shared/config/configuration';
import { LoggerModule } from '../Infrastructure/logger/logger.module';
import { MongoModule } from '../Infrastructure/mongo/mongo.module';
import { RedisModule } from '../Infrastructure/redis/redis.module';



@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      envFilePath: ['.env'],
    }),

    LoggerModule.forRootAsync(),

    RedisModule.forRootAsync(),

    MongoModule.forRootAsync(),

    UserModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})

export class AppModule {}