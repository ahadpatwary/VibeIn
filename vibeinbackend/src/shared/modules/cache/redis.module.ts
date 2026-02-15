import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Optional: একবার import করলে app এর সব module এ accessible
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
