    // this._opts = {
    //   enablePenalty: globalOptions.enablePenalty ?? true,
    //   penaltyThreshold: globalOptions.penaltyThreshold ?? 10,
    //   failOpen: globalOptions.failOpen ?? false,
    // };
import 'reflect-metadata'

import { registerRedis } from '@app/redis-client';
import { container } from "tsyringe";
import { StoreService } from '../redis/redisService';

console.log("ahad");



// container.resolve(StoreService);
