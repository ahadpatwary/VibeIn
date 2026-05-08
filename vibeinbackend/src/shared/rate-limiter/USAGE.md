#!/bin/bash

# Example: How to use the typed Rate Limiter

# 1. Initialize

import { RateLimiter } from './rete-limiter';
import Redis from 'ioredis';

const redis = new Redis();
const limiter = new RateLimiter(redis, {
enablePenalty: true,
penaltyThreshold: 10,
failOpen: false,
});

await limiter.init();

# 2. Use with Sliding Window (default, industry standard)

const decision = await limiter.check('user:123', {
algorithm: 'sliding-window',
limit: 100,
windowSecs: 60,
keyspace: 'api:endpoints',
});

if (!decision.allowed) {
// Return 429 Too Many Requests
console.log(`Retry after ${decision.retryAfter} seconds`);
}

# 3. Use with Token Bucket (allows bursts)

const decision = await limiter.check('api:key:xyz', {
algorithm: 'token-bucket',
capacity: 50, // max burst
refillRate: 10, // 10 tokens/sec
cost: 1, // 1 token per request
keyspace: 'api:burst',
});

# 4. Use with Fixed Window (simple)

const decision = await limiter.check('ip:192.168.1.1', {
algorithm: 'fixed-window',
limit: 50,
windowSecs: 60,
});

# 5. Use with Leaky Bucket (smooth rate)

const decision = await limiter.check('user:premium', {
algorithm: 'leaky-bucket',
capacity: 30, // max queue size
leakRate: 5, // 5 req/sec
});

# 6. Manage whitelist/blacklist

await limiter.whitelist('vip:user:1'); // bypass all limits
await limiter.blacklist('abuser:ip'); // permanent block

# 7. Get violation status

const status = await limiter.getStatus('user:123', 'api:endpoints');
console.log(status); // { violations, banned, banTTL, whitelisted, blacklisted }

# 8. Reset limits

await limiter.reset('user:123', 'api:endpoints');
