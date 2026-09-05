# Outbox CDC → RabbitMQ Relay (Orderbari / TrustLoop)

Transactional Outbox pattern + **native MongoDB Change Streams as the CDC mechanism** (no Kafka/Debezium needed) → RabbitMQ, with a polling reconciliation job as a safety net.

## Why Change Streams instead of Debezium?

Debezium's MongoDB connector normally ships events into **Kafka** via Kafka Connect. Since you explicitly don't want Kafka in this pipeline, Change Streams are the right native tool — MongoDB reads them directly off the **oplog**, so there's no polling on your business collections. The only polling in this design is the reconciliation job, and that only scans a narrow `outbox_events` slice, not your domain data.

## Requirements

- **MongoDB replica set or sharded cluster.** Change streams and multi-document transactions both require this — a standalone `mongod` will throw `ChangeStreamNotSupportedError` / transaction errors. For local dev, run Mongo as a single-node replica set (`rs.initiate()`).
- RabbitMQ with a durable topic exchange (`trustloop.events` by default).

## Data flow

1. **Write path** — `OutboxWriterService.writeWithOutbox()` opens a Mongo session, runs your business write (e.g. `Order.create`), and inserts a doc into `outbox_events` — **same transaction**. Either both commit or neither does.
2. **CDC** — `OutboxChangeStreamWatcher` watches `outbox_events` for inserts via `$changeStream`, using `fullDocument: "updateLookup"`. Every change advances a persisted **resume token** in `change_stream_checkpoints`, so a process restart resumes exactly where it left off instead of re-scanning or missing events.
3. **Handler** — `OutboxEventHandler` transforms the raw doc into a `PublishMessage` (routing key = `eventType`, message ID = `eventId` for idempotent consumers).
4. **Processor** — `OutboxRelayProcessor` publishes via `RabbitMQPublisher` (publisher-confirms, so it only resolves once the broker ACKs), then flips the outbox doc to `PUBLISHED`. Failures increment `retryCount`; after `OUTBOX_MAX_PUBLISH_RETRIES` the doc is marked `FAILED` for manual/alerted follow-up — treat this as your DLQ trigger.
5. **Reconciliation** — `OutboxReconciliationJob` polls every `RECONCILIATION_INTERVAL_MS` for `PENDING` docs older than `RECONCILIATION_STALE_AFTER_MS` and re-drives them through the *same* processor. This catches: process crash between insert and stream pickup, `ChangeStreamHistoryLost` (resume token expired off the oplog — a common gap-source when the relay is down longer than the oplog window), or any handler exception that occurred before the checkpoint advanced.

## Error hierarchy

Three namespaced hierarchies, all extending a shared `AppError`, mirroring your existing `mapMongooseError` / `mapKafkaError` / `mapRedisError` pattern:

- `OUTBOX_*` — write failures, transaction aborts, max-retries-exceeded, schema validation
- `CDC_*` — change stream connection issues, invalid/expired resume token, unsupported deployment topology
- `RMQ_*` — connection, channel, publish-nack, publish-confirm-timeout, exchange mismatch

Each has a `mapXxxError()` translator and every error carries `.retryable`, `.fullCode`, `.toLogSafeJSON()`.

## Idempotency on the consumer side

Downstream consumers should dedupe on the RabbitMQ message's `messageId` (= the outbox `eventId`, a UUID). This matters because:
- Publisher-confirm timeout ⇒ retry ⇒ possible duplicate publish if the original actually landed.
- Reconciliation and the live change-stream path could both attempt the same doc in a race window.

The relay guarantees **at-least-once** delivery, never at-most-once — design consumers accordingly (this is standard for outbox-pattern systems).

## What's NOT included (add per your ops needs)

- A dedicated DLQ exchange/queue in RabbitMQ for `FAILED` events (currently they just sit as `status: FAILED` in Mongo for alerting/manual replay — trivial to wire a `dead-letter-exchange` arg on the queue if you want broker-side DLQ instead).
- Metrics/tracing hooks (there are clear injection points in the `logger.*` calls).
- TLS/mTLS RabbitMQ config (same pattern as your Temporal Cloud setup — pass `amqps://` URL + cert options into `amqplib.connect()`).

## Env vars

See `src/config/outbox-cdc.config.ts` for the full Zod schema — `MONGO_URI`, `RABBITMQ_URL`, retry/backoff tuning, reconciliation interval, etc.
