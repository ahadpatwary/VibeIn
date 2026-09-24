# @yourscope/mongo-db-core

Production-grade, class-based MongoDB (Mongoose) data-access core, built with tsyringe DI.

## Structure

```
src/
├── config/       Zod-validated DatabaseConfig schema
├── constants/     Pool sizes, timeouts, retry defaults, event names
├── container/     registerDatabaseModule() — tsyringe DI wiring
├── exception/     DatabaseException hierarchy + mapMongooseError() translator
├── tokens/        Symbol-based DI tokens
├── types/         DatabaseConfig, Logger, Pagination types
├── util/          withRetry / @Retryable (exponential backoff + jitter), ConsoleLogger
├── client/        MongooseClient — connection lifecycle, transactions
└── repository/    BaseRepository<T> — generic CRUD + pagination
```

## Install

```bash
npm install @yourscope/mongo-db-core mongoose tsyringe reflect-metadata zod
```

`reflect-metadata` must be imported once, at your app's entrypoint, before anything else.

## Quick start

```ts
import 'reflect-metadata';
import { container } from 'tsyringe';
import { registerDatabaseModule, MongooseClient } from '@yourscope/mongo-db-core';

registerDatabaseModule({ config: { uri: process.env.MONGO_URI, dbName: 'orderbari' } });

const client = container.resolve(MongooseClient);
await client.connect();
```

## Writing a repository

```ts
@injectable()
export class UserRepository extends BaseRepository<UserDocument> {
   constructor() {
      super(UserModel);
   }
}
```

See `src/examples/` for a full worked example (schema, repository, bootstrap).

## Why schemas are NOT inside this package

This package is intentionally **schema-agnostic**. It ships `BaseRepository<T>`, which
takes any `Model<T>` — it does not define or own any Mongoose schema itself.

Reasoning:

- A generic "database core" package is infrastructure, reused across every service/app.
  Schemas are domain/business data — they change per feature, per app, per team, on a
  completely different release cadence than connection/retry/error-mapping logic. Coupling
  them forces a full package version bump + republish + reinstall cycle for a one-field
  schema tweak, which does not scale past a handful of apps.
- If two apps import the same package but need slightly different validation on the "same"
  entity (e.g. Orderbari's `Order` vs a future admin-panel's `Order`), a shared schema
  becomes a merge conflict generator.
- Industry precedent (NestJS's `@nestjs/mongoose`, TypeORM, Prisma's generated client)
  keeps the infra layer schema-agnostic and lets consuming apps own their own models,
  precisely for this reason.

If you truly have entities that are 100% identical and reused verbatim across multiple
apps (e.g. a shared `AuditLog` or `OutboxEvent` model used by every microservice), that's
a legitimate case for a **separate**, versioned `@yourscope/shared-models` package — kept
apart from this connection/repository core, so its release cycle doesn't couple to
infra changes.
