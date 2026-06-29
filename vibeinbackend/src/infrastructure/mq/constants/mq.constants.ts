

export const RabbitMQ_CONSTANTS = {
 
  url: 'amqp://user:pass@host:port/vhost',
  connectionName: 'vibein-backend',
  maxReconnectAttempts: Infinity,
  reconnectDelay: 1000,
  maxReconnectDelay: 30_000,
  heartbeat: 60,
  prefetch: 10,
  publisherConfirmTimeout: 5000,
} as const;

export const ExchangeConfig = {
  name: 'default',
  type: 'direct' as const,
  durable: true,
  autoDelete: false,
  internal: false,
  alternateExchange: undefined,
} as const;

export const QueueConfig = { 
  name: 'default',
  durable: true,
  exclusive: false,
  autoDelete: false,
  messageTtl: undefined,
  maxLength: undefined,
  maxLengthBytes: undefined,
  overflow: undefined,
  deadLetterExchange: undefined,
  deadLetterRoutingKey: undefined,
  lazy: undefined,
} as const;

export const RetryConfig ={
  maxAttempts: 5,
  initialDelay: 1000,
  multiplier: 2,
  maxDelay: 60_000,
  jitter: true,
}

export const DLQConfig = {
  exchangeName: undefined,
  queueName: undefined,
  routingKey: undefined,
  messageTtl: undefined,
}

export const PublishOptions = {
  routingKey: undefined,
  priority: undefined,
  expiration: undefined,
  headers: {},
  correlationId: undefined,
  replyTo: undefined,
  mandatory: undefined,
  persistent: undefined,
  messageId: undefined,
}

export const ConsumeOptions = {
  noAck: undefined,
  consumerTag: undefined,
  prefetch: undefined,
}

export const MessageEnvelope = {
  id: undefined,
  timestamp: undefined,
  data: undefined,
  attempt: 0,
  exchange: '',
  routingKey: '',
  correlationId: undefined,
  headers: {} as Record<string, unknown>,
  retryReason: undefined,
}

export const ConsumeContext = {
  message: undefined,
  ack: () => {},
  nack: (requeue?: boolean) => {},
  reject: () => {},
}

export const HealthStatus = {
  connected: false,
  reconnecting: false,
  reconnectAttempts: 0,
  channelCount: 0,
  uptime: 0,
  lastError: new Error(),
}

export const RABBITMQ_ERRORS = {
  // ── Connection ─────────────────────────────────────────────
  CONNECTION_FAILED:         'RABBITMQ_CONNECTION_FAILED',
  CONNECTION_CLOSED:         'RABBITMQ_CONNECTION_CLOSED',
  CONNECTION_TIMEOUT:        'RABBITMQ_CONNECTION_TIMEOUT',
  MAX_RECONNECT_EXCEEDED:    'RABBITMQ_MAX_RECONNECT_EXCEEDED',
  NOT_INITIALIZED:           'RABBITMQ_NOT_INITIALIZED',
 
  // ── Channel ────────────────────────────────────────────────
  CHANNEL_CREATION_FAILED:   'RABBITMQ_CHANNEL_CREATION_FAILED',
  CHANNEL_CLOSED:            'RABBITMQ_CHANNEL_CLOSED',
  CHANNEL_NOT_AVAILABLE:     'RABBITMQ_CHANNEL_NOT_AVAILABLE',
 
  // ── Topology ───────────────────────────────────────────────
  EXCHANGE_ASSERT_FAILED:    'RABBITMQ_EXCHANGE_ASSERT_FAILED',
  QUEUE_ASSERT_FAILED:       'RABBITMQ_QUEUE_ASSERT_FAILED',
  BINDING_FAILED:            'RABBITMQ_BINDING_FAILED',
  TOPOLOGY_SETUP_FAILED:     'RABBITMQ_TOPOLOGY_SETUP_FAILED',
 
  // ── Publish ────────────────────────────────────────────────
  PUBLISH_FAILED:            'RABBITMQ_PUBLISH_FAILED',
  PUBLISH_TIMEOUT:           'RABBITMQ_PUBLISH_TIMEOUT',
  PUBLISHER_CONFIRM_NACK:    'RABBITMQ_PUBLISHER_CONFIRM_NACK',
 
  // ── Consume ────────────────────────────────────────────────
  CONSUMER_START_FAILED:     'RABBITMQ_CONSUMER_START_FAILED',
  CONSUMER_CANCELLED:        'RABBITMQ_CONSUMER_CANCELLED',
  MESSAGE_PROCESSING_FAILED: 'RABBITMQ_MESSAGE_PROCESSING_FAILED',
  MESSAGE_ACK_FAILED:        'RABBITMQ_MESSAGE_ACK_FAILED',
  MESSAGE_NACK_FAILED:       'RABBITMQ_MESSAGE_NACK_FAILED',
 
  // ── Retry / DLQ ────────────────────────────────────────────
  RETRY_EXHAUSTED:           'RABBITMQ_RETRY_EXHAUSTED',
  RETRY_TOPOLOGY_FAILED:     'RABBITMQ_RETRY_TOPOLOGY_FAILED',
  DEAD_LETTER_FAILED:        'RABBITMQ_DEAD_LETTER_FAILED',
 
  // ── Serialization ──────────────────────────────────────────
  SERIALIZATION_ERROR:       'RABBITMQ_SERIALIZATION_ERROR',
  DESERIALIZATION_ERROR:     'RABBITMQ_DESERIALIZATION_ERROR',
 
  // ── RPC ────────────────────────────────────────────────────
  RPC_TIMEOUT:               'RABBITMQ_RPC_TIMEOUT',
  RPC_SERVER_ERROR:          'RABBITMQ_RPC_SERVER_ERROR',
  RPC_NOT_INITIALIZED:       'RABBITMQ_RPC_NOT_INITIALIZED',
} as const;
 
export type RabbitMQErrorCode = (typeof RABBITMQ_ERRORS)[keyof typeof RABBITMQ_ERRORS];