import { FixedWindowCounter } from "../../../../outside/algorithms/fixed-window";
import { LeakyBucket } from "../../../../outside/algorithms/leaky-bucket";
import { SlidingWindowCounter } from "../../../../outside/algorithms/sliding-window";
import { TokenBucket } from "../../../../outside/algorithms/token-bucket";
import { IAlgorithmEngine, RateLimitAlgorithm } from "../types/types";
import Redis from 'ioredis'

export const ALGORITHMS: Record<RateLimitAlgorithm, new (redis: Redis) => IAlgorithmEngine> = {
    'fixed-window': FixedWindowCounter,
    'sliding-window': SlidingWindowCounter,
    'token-bucket': TokenBucket,
    'leaky-bucket': LeakyBucket,
};

export const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'sliding-window';
export const PENALTY_KEY_PREFIX = 'rl:penalty';
export const BLACKLIST_KEY = 'rl:blacklist';
export const WHITELIST_KEY = 'rl:whitelist';


// Penalty: exponential backoff ban durations (seconds)
export const PENALTY_TIERS: readonly number[] = [60, 300, 1800, 86400]; // 1m, 5m, 30m, 24h


