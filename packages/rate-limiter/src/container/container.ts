import type { PinoConfig } from '@app/logger';
import { registerLogger } from '@app/logger';
import type { RedisConfig } from '@app/redis-client';
import { loadRedisConfig, registerRedis } from '@app/redis-client';
import type { DependencyContainer } from 'tsyringe';
import { container } from 'tsyringe';

import { loadGlocalOption } from '../config/config';
import { RATE_LIMIT_TOKENS } from '../token/token';
import type { RateLimiterOptions } from '../types/types';

export function registerRateLimiter(
   targetContainer: DependencyContainer = container,
   globalOption: RateLimiterOptions,
   redisConfig: RedisConfig,
   pinoConfig: PinoConfig,
): void {
   const redisCfg = loadRedisConfig(redisConfig);

   const globalOpt = loadGlocalOption(globalOption);

   registerLogger(targetContainer, pinoConfig);
   registerRedis(targetContainer, redisCfg);

   targetContainer.registerInstance(RATE_LIMIT_TOKENS.GlobalOptions, globalOpt);
}
