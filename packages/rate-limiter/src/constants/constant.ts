import { RateLimitAlgorithm } from "../types/types";


export const DEFAULT_ALGORITHM: RateLimitAlgorithm = 'sliding-window';
export const PENALTY_KEY_PREFIX = 'rl:penalty';
export const BLACKLIST_KEY = 'rl:blacklist';
export const WHITELIST_KEY = 'rl:whitelist';


// Penalty: exponential backoff ban durations (seconds)
export const PENALTY_TIERS: readonly number[] = [60, 300, 1800, 86400]; // 1m, 5m, 30m, 24h