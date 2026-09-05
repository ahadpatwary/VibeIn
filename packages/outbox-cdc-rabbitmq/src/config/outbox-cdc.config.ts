import { z } from "zod";

const envSchema = z.object({
  // Mongo
  MONGO_URI: z.string().url(),
  MONGO_DB_NAME: z.string().min(1),
  OUTBOX_COLLECTION: z.string().default("outbox_events"),
  CHECKPOINT_COLLECTION: z.string().default("change_stream_checkpoints"),

  // RabbitMQ
  RABBITMQ_URL: z.string().min(1), // amqp://user:pass@host:5672/vhost
  RABBITMQ_EXCHANGE: z.string().default("trustloop.events"),
  RABBITMQ_EXCHANGE_TYPE: z.enum(["topic", "direct", "fanout"]).default("topic"),
  RABBITMQ_PUBLISHER_CONFIRM_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  RABBITMQ_RECONNECT_BASE_DELAY_MS: z.coerce.number().int().positive().default(500),
  RABBITMQ_RECONNECT_MAX_DELAY_MS: z.coerce.number().int().positive().default(30_000),

  // Outbox publish retry
  OUTBOX_MAX_PUBLISH_RETRIES: z.coerce.number().int().nonnegative().default(5),
  OUTBOX_RETRY_BASE_DELAY_MS: z.coerce.number().int().positive().default(300),
  OUTBOX_RETRY_MAX_DELAY_MS: z.coerce.number().int().positive().default(10_000),

  // Reconciliation (safety net poller)
  RECONCILIATION_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
  RECONCILIATION_STALE_AFTER_MS: z.coerce.number().int().positive().default(60_000),
  RECONCILIATION_BATCH_SIZE: z.coerce.number().int().positive().default(100),

  // Change stream
  CHANGE_STREAM_FULL_DOCUMENT: z.enum(["default", "updateLookup"]).default("updateLookup"),
});

export type OutboxCdcConfig = Readonly<{
  mongo: {
    uri: string;
    dbName: string;
    outboxCollection: string;
    checkpointCollection: string;
  };
  rabbitmq: {
    url: string;
    exchange: string;
    exchangeType: "topic" | "direct" | "fanout";
    publisherConfirmTimeoutMs: number;
    reconnectBaseDelayMs: number;
    reconnectMaxDelayMs: number;
  };
  outboxRetry: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  reconciliation: {
    intervalMs: number;
    staleAfterMs: number;
    batchSize: number;
  };
  changeStream: {
    fullDocument: "default" | "updateLookup";
  };
}>;

function loadConfig(): OutboxCdcConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`[OutboxCdcConfig] Invalid environment configuration -> ${issues}`);
  }

  const env = parsed.data;

  return Object.freeze({
    mongo: {
      uri: env.MONGO_URI,
      dbName: env.MONGO_DB_NAME,
      outboxCollection: env.OUTBOX_COLLECTION,
      checkpointCollection: env.CHECKPOINT_COLLECTION,
    },
    rabbitmq: {
      url: env.RABBITMQ_URL,
      exchange: env.RABBITMQ_EXCHANGE,
      exchangeType: env.RABBITMQ_EXCHANGE_TYPE,
      publisherConfirmTimeoutMs: env.RABBITMQ_PUBLISHER_CONFIRM_TIMEOUT_MS,
      reconnectBaseDelayMs: env.RABBITMQ_RECONNECT_BASE_DELAY_MS,
      reconnectMaxDelayMs: env.RABBITMQ_RECONNECT_MAX_DELAY_MS,
    },
    outboxRetry: {
      maxRetries: env.OUTBOX_MAX_PUBLISH_RETRIES,
      baseDelayMs: env.OUTBOX_RETRY_BASE_DELAY_MS,
      maxDelayMs: env.OUTBOX_RETRY_MAX_DELAY_MS,
    },
    reconciliation: {
      intervalMs: env.RECONCILIATION_INTERVAL_MS,
      staleAfterMs: env.RECONCILIATION_STALE_AFTER_MS,
      batchSize: env.RECONCILIATION_BATCH_SIZE,
    },
    changeStream: {
      fullDocument: env.CHANGE_STREAM_FULL_DOCUMENT,
    },
  });
}

export const outboxCdcConfig: OutboxCdcConfig = loadConfig();
