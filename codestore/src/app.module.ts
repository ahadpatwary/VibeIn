import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './infrastructure/cache/redis.module';
import { createRedisConfig } from './infrastructure/cache';
import { DatabaseModule } from './infrastructure/database/database.module';
import { createDatabaseConfig } from './infrastructure/database/config/database.config';

@Module({
  imports: [
    RedisModule.forRoot( createRedisConfig() ),
    DatabaseModule.forRoot( createDatabaseConfig() ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
