# Rate Limiter - Industry Standard TypeScript Implementation

A production-grade, fully-typed rate limiter for Node.js with Redis backend, featuring 4 algorithm options, penalty system, and atomic Lua operations.

## ✨ Features

- **4 Algorithms**: Sliding-Window (default), Fixed-Window, Token-Bucket, Leaky-Bucket
- **Fully Typed**: Complete TypeScript support with strict types
- **Penalty System**: Exponential backoff for repeat offenders
- **Whitelist/Blacklist**: Per-identifier override management
- **Atomic Operations**: Lua scripts ensure consistency
- **Fail-Open/Fail-Closed**: Configurable Redis failure behavior
- **ES6 Modules**: Modern TypeScript/JavaScript syntax

## 📦 Installation

```bash
npm install ioredis
```

## 🚀 Quick Start

```typescript
import { RateLimiter } from './rate-limiter';
import Redis from 'ioredis';

const redis = new Redis();
const limiter = new RateLimiter(redis, {
  enablePenalty: true,
  penaltyThreshold: 10,
  failOpen: false,
});

await limiter.init();

// Check rate limit
const decision = await limiter.check('user:123', {
  algorithm: 'sliding-window',
  limit: 100,
  windowSecs: 60,
});

if (!decision.allowed) {
  res.status(429).json({
    error: 'Too Many Requests',
    retryAfter: decision.retryAfter,
  });
}
```

## 🔧 Algorithms

### Sliding Window Counter (Default ⭐)
- **Industry Standard**: Used by Cloudflare, Stripe, most production APIs
- **Accuracy**: ~99.9% (weighted approximation)
- **Burst Issue**: None (smooth boundary handling)
- **Memory**: O(1) - exactly 2 Redis keys per identifier
- **Use Case**: General-purpose API rate limiting

```typescript
await limiter.check('user:123', {
  algorithm: 'sliding-window',
  limit: 100,
  windowSecs: 60,
});
```

### Fixed Window Counter
- **Simplicity**: Easiest to understand and implement
- **Burst Issue**: Yes (up to 2x requests at boundaries)
- **Memory**: O(1) - 1 Redis key per identifier
- **Use Case**: Internal services, simple admin panels

```typescript
await limiter.check('user:123', {
  algorithm: 'fixed-window',
  limit: 100,
  windowSecs: 60,
});
```

### Token Bucket
- **Burst Tolerance**: Allows burst traffic within capacity
- **Flexibility**: Different cost per operation
- **Smooth Refill**: Tokens accumulate automatically
- **Use Case**: APIs requiring burst tolerance (AWS, GCP)

```typescript
await limiter.check('user:123', {
  algorithm: 'token-bucket',
  capacity: 50,      // max burst
  refillRate: 10,    // 10 tokens/sec
  cost: 1,           // optional: tokens per request
});
```

### Leaky Bucket
- **Smooth Output**: Guarantees constant processing rate
- **Zero Burst**: No burst traffic allowed
- **Queue**: Requests queue if bucket is full
- **Use Case**: Payment processors, strict rate enforcement

```typescript
await limiter.check('user:123', {
  algorithm: 'leaky-bucket',
  capacity: 30,      // queue size
  leakRate: 5,       // 5 req/sec
});
```

## 🔐 Penalty System

Automatic ban escalation for repeat offenders:

```typescript
// Penalty Tiers (exponential backoff):
// 1st violation: 1 min ban
// 2nd violation: 5 min ban
// 3rd violation: 30 min ban
// 4th+ violations: 24h ban

const decision = await limiter.check('user:123', config);

if (!decision.allowed && decision.reason === 'PENALTY_BAN') {
  // User is temporarily banned
  console.log(`Banned for ${decision.retryAfter} seconds`);
}
```

### Disable Penalty System

```typescript
const limiter = new RateLimiter(redis, {
  enablePenalty: false, // Disable penalty system
});
```

## 👥 Whitelist & Blacklist

```typescript
// Whitelist (bypass all rate limits)
await limiter.whitelist('vip:user:1');
await limiter.whitelist('internal:service', 3600); // expires in 1 hour

// Check list status
const status = await limiter.getStatus('user:123');
console.log(status.whitelisted); // true/false
console.log(status.blacklisted); // true/false

// Remove from whitelist
await limiter.unwhitelist('vip:user:1');

// Blacklist (permanent block)
await limiter.blacklist('attacker:ip');
await limiter.blacklist('abuser:api:key', 86400); // expires in 24h

// Remove from blacklist
await limiter.unblacklist('attacker:ip');
```

## 📊 Status & Metrics

```typescript
const status = await limiter.getStatus('user:123', 'api:endpoints');

console.log(status);
// {
//   identifier: 'user:123',
//   violations: 5,
//   banned: true,
//   banTTL: 1200,          // seconds remaining
//   whitelisted: false,
//   blacklisted: false,
// }
```

## 🔄 Reset Limits

```typescript
// Reset all limits for an identifier
await limiter.reset('user:123');

// Reset with keyspace
await limiter.reset('user:123', 'api:endpoints');

// Reset penalties only
await limiter.reset('user:123');
```

## ⚙️ Configuration Options

### RateLimiterOptions

```typescript
{
  enablePenalty?: boolean;      // Default: true
  penaltyThreshold?: number;    // Default: 10 (violations before ban)
  failOpen?: boolean;           // Default: false
}
```

### Fail-Open Mode

When Redis is unavailable:

```typescript
const limiter = new RateLimiter(redis, {
  failOpen: true, // Allow requests (degraded mode)
});

const decision = await limiter.check('user:123', config);
console.log(decision.reason); // 'FAIL_OPEN'
```

## 🎯 Response Types

### RateLimitDecision

```typescript
interface RateLimitDecision {
  allowed: boolean;              // Was request allowed?
  identifier: string;            // Who was limited
  algorithm: string;             // Which algorithm used
  limit: number;                 // Limit for this window
  remaining: number;             // Remaining tokens/requests
  resetAt: Date;                 // When limit resets
  retryAfter: number | null;     // Seconds to retry (if denied)
  count: number;                 // Current count
  keyspace: string | null;       // Custom namespace
  reason: 'OK' | 'RATE_LIMITED' | 'BLACKLISTED' | 'PENALTY_BAN' | 'FAIL_OPEN';
}
```

## 🏗️ Architecture

```
Rate Limiter
├── RateLimiter (Main class)
├── IAlgorithmEngine (Interface)
├── Algorithms
│   ├── SlidingWindowCounter ⭐
│   ├── FixedWindowCounter
│   ├── TokenBucket
│   └── LeakyBucket
└── Redis Backend (Lua scripts)
    ├── LUA_SLIDING_WINDOW
    ├── LUA_FIXED_WINDOW
    ├── LUA_TOKEN_BUCKET
    ├── LUA_LEAKY_BUCKET
    └── LUA_PENALIZE
```

## 🧪 Example: Express Middleware

```typescript
import express from 'express';
import { RateLimiter } from './rate-limiter';
import Redis from 'ioredis';

const app = express();
const redis = new Redis();
const limiter = new RateLimiter(redis);

await limiter.init();

// Middleware
app.use((req, res, next) => {
  const ip = req.ip;
  
  limiter.check(ip, {
    algorithm: 'sliding-window',
    limit: 100,
    windowSecs: 60,
    keyspace: 'api:general',
  }).then(decision => {
    res.set('X-RateLimit-Limit', decision.limit.toString());
    res.set('X-RateLimit-Remaining', decision.remaining.toString());
    res.set('X-RateLimit-Reset', (decision.resetAt.getTime() / 1000).toString());

    if (!decision.allowed) {
      res.set('Retry-After', decision.retryAfter.toString());
      return res.status(429).json({
        error: 'Too Many Requests',
        message: decision.reason,
        retryAfter: decision.retryAfter,
      });
    }

    next();
  });
});

// Routes
app.get('/api/users', (req, res) => {
  res.json({ users: [...] });
});
```

## 🔒 Security Considerations

1. **Redis Auth**: Use Redis with authentication in production
2. **Namespacing**: Always use unique keyspaces per route/service
3. **TTL Management**: Automatic expiry prevents stale keys
4. **Lua Atomicity**: All operations are atomic (no race conditions)

## 📈 Performance

- **Time Complexity**: O(1) per check
- **Memory Usage**: O(n) where n = unique identifiers
- **Redis Calls**: 1-3 calls per check (depends on whitelist/blacklist)
- **Latency**: ~5-10ms per request (typical Redis latency)

## 🐛 Troubleshooting

### "RateLimiter: call init() first"
Make sure to call `await limiter.init()` before using `check()`.

### "NOSCRIPT" errors
Rate limiter automatically handles NOSCRIPT errors by reloading Lua scripts.

### Penalty ban not working
Check that `enablePenalty: true` is set (default) and `penaltyThreshold` is reasonable.

## 📄 License

MIT
