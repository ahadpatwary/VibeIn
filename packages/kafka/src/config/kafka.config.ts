import { z } from 'zod';

/**
 * Central Kafka configuration schema.
 * Sob KafkaJS related env variable ekhane validate hoy — client, producer,
 * consumer, retry/backoff, SASL/SSL — sob ekjaygay.
 */
const kafkaConfigSchema = z.object({
  // ---- Client / Broker ----
  clientId: z.string().min(1, 'KAFKA_CLIENT_ID is required'),
  brokers: z
    .string()
    .min(1, 'KAFKA_BROKERS is required')
    .transform((val) => val.split(',').map((b) => b.trim())),
  connectionTimeout: z.coerce.number().int().positive().default(3000),
  requestTimeout: z.coerce.number().int().positive().default(30000),
  enforceRequestTimeout: z.coerce.boolean().default(true),

  // ---- SSL ----
  ssl: z.coerce.boolean().default(false),

  // ---- SASL ----
  saslEnabled: z.coerce.boolean().default(false),
  saslMechanism: z
    .enum(['plain', 'scram-sha-256', 'scram-sha-512'])
    .default('plain'),
  saslUsername: z.string().optional(),
  saslPassword: z.string().optional(),

  // ---- Client-level retry (connection / metadata refresh retries) ----
  clientRetryMaxRetryTime: z.coerce.number().int().positive().default(30000),
  clientRetryInitialRetryTime: z.coerce.number().int().positive().default(300),
  clientRetryFactor: z.coerce.number().positive().default(0.2),
  clientRetryMultiplier: z.coerce.number().positive().default(2),
  clientRetryRetries: z.coerce.number().int().nonnegative().default(8),

  // ---- Producer ----
  producerAllowAutoTopicCreation: z.coerce.boolean().default(false),
  producerTransactionTimeout: z.coerce.number().int().positive().default(60000),
  producerIdempotent: z.coerce.boolean().default(true),
  producerMaxInFlightRequests: z.coerce.number().int().positive().default(5),

  // ---- Consumer ----
  consumerGroupId: z.string().min(1, 'KAFKA_CONSUMER_GROUP_ID is required'),
  consumerSessionTimeout: z.coerce.number().int().positive().default(30000),
  consumerRebalanceTimeout: z.coerce.number().int().positive().default(60000),
  consumerHeartbeatInterval: z.coerce.number().int().positive().default(3000),
  consumerMaxBytesPerPartition: z.coerce.number().int().positive().default(1048576), // 1MB
  consumerMaxWaitTimeInMs: z.coerce.number().int().nonnegative().default(5000),
  consumerAllowAutoTopicCreation: z.coerce.boolean().default(false),
  consumerAutoCommit: z.coerce.boolean().default(false), // manual commit for production safety

  // ---- Application-level retry/backoff (for message handler failures) ----
  handlerMaxRetries: z.coerce.number().int().nonnegative().default(5),
  handlerBaseDelayMs: z.coerce.number().int().positive().default(200),
  handlerMaxDelayMs: z.coerce.number().int().positive().default(15000),

  // ---- Dead Letter Queue ----
  dlqEnabled: z.coerce.boolean().default(true),
  dlqTopicSuffix: z.string().default('.dlq'),

  // ---- Logging ----
  logLevel: z.enum(['NOTHING', 'ERROR', 'WARN', 'INFO', 'DEBUG']).default('ERROR'),
});

export type KafkaClientConfig = z.infer<typeof kafkaConfigSchema>;

let cachedConfig: KafkaClientConfig | null = null;

/**
 * Loads and validates Kafka config from process.env.
 * Ekbar validate hoye gele cache hoye thake — process lifetime e ekbari.
 * Fail-fast: env missing/invalid hole app boot e crash korbe, runtime e na.
 */
export function loadKafkaConfig(env: NodeJS.ProcessEnv = process.env): KafkaClientConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = kafkaConfigSchema.safeParse({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKERS,
    connectionTimeout: env.KAFKA_CONNECTION_TIMEOUT,
    requestTimeout: env.KAFKA_REQUEST_TIMEOUT,
    enforceRequestTimeout: env.KAFKA_ENFORCE_REQUEST_TIMEOUT,

    ssl: env.KAFKA_SSL,

    saslEnabled: env.KAFKA_SASL_ENABLED,
    saslMechanism: env.KAFKA_SASL_MECHANISM,
    saslUsername: env.KAFKA_SASL_USERNAME,
    saslPassword: env.KAFKA_SASL_PASSWORD,

    clientRetryMaxRetryTime: env.KAFKA_CLIENT_RETRY_MAX_RETRY_TIME,
    clientRetryInitialRetryTime: env.KAFKA_CLIENT_RETRY_INITIAL_RETRY_TIME,
    clientRetryFactor: env.KAFKA_CLIENT_RETRY_FACTOR,
    clientRetryMultiplier: env.KAFKA_CLIENT_RETRY_MULTIPLIER,
    clientRetryRetries: env.KAFKA_CLIENT_RETRY_RETRIES,

    producerAllowAutoTopicCreation: env.KAFKA_PRODUCER_ALLOW_AUTO_TOPIC_CREATION,
    producerTransactionTimeout: env.KAFKA_PRODUCER_TRANSACTION_TIMEOUT,
    producerIdempotent: env.KAFKA_PRODUCER_IDEMPOTENT,
    producerMaxInFlightRequests: env.KAFKA_PRODUCER_MAX_IN_FLIGHT_REQUESTS,

    consumerGroupId: env.KAFKA_CONSUMER_GROUP_ID,
    consumerSessionTimeout: env.KAFKA_CONSUMER_SESSION_TIMEOUT,
    consumerRebalanceTimeout: env.KAFKA_CONSUMER_REBALANCE_TIMEOUT,
    consumerHeartbeatInterval: env.KAFKA_CONSUMER_HEARTBEAT_INTERVAL,
    consumerMaxBytesPerPartition: env.KAFKA_CONSUMER_MAX_BYTES_PER_PARTITION,
    consumerMaxWaitTimeInMs: env.KAFKA_CONSUMER_MAX_WAIT_TIME_MS,
    consumerAllowAutoTopicCreation: env.KAFKA_CONSUMER_ALLOW_AUTO_TOPIC_CREATION,
    consumerAutoCommit: env.KAFKA_CONSUMER_AUTO_COMMIT,

    handlerMaxRetries: env.KAFKA_HANDLER_MAX_RETRIES,
    handlerBaseDelayMs: env.KAFKA_HANDLER_BASE_DELAY_MS,
    handlerMaxDelayMs: env.KAFKA_HANDLER_MAX_DELAY_MS,

    dlqEnabled: env.KAFKA_DLQ_ENABLED,
    dlqTopicSuffix: env.KAFKA_DLQ_TOPIC_SUFFIX,

    logLevel: env.KAFKA_LOG_LEVEL,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid Kafka configuration -> ${issues}`);
  }

  if (parsed.data.saslEnabled && (!parsed.data.saslUsername || !parsed.data.saslPassword)) {
    throw new Error(
      'Invalid Kafka configuration -> KAFKA_SASL_USERNAME and KAFKA_SASL_PASSWORD are required when KAFKA_SASL_ENABLED=true',
    );
  }

  cachedConfig = parsed.data;
  return cachedConfig;
}

/** Test/reset helper — cache clear kore fresh load korte hole */
export function resetKafkaConfigCache(): void {
  cachedConfig = null;
}