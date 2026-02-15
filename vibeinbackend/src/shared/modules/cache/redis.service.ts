import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(
        "rediss://default:Ad9AAAIncDEyNGU2OWMzZGM2NDM0YTZkYmEwYmY0ZjA4MGVhMjIzYnAxNTcxNTI@driven-lionfish-57152.upstash.io:6379",
        {
            retryStrategy(times: number) {
                // reconnect delay, 50ms * attempt, max 2000ms
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        },
    );
    console.log('Redis connected');
  }

  onModuleDestroy() {
    this.client.quit();
    console.log('Redis disconnected');
  }

  RedisClient () {
    return this.client;
  }

}
