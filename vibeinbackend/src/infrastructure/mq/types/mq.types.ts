
export interface RabbitMQConfig {
  url: string;
  /** Human-readable connection name shown in RabbitMQ management UI */
  connectionName?: string;
  /** Max reconnect attempts before giving up (default: Infinity) */
  maxReconnectAttempts?: number;
  /** Initial reconnect delay in ms (default: 1000) */
  reconnectDelay?: number;
  /** Max reconnect delay cap in ms (default: 30_000) */
  maxReconnectDelay?: number;
  /** Heartbeat interval in seconds (default: 60) */
  heartbeat?: number;
  /** Channel prefetch count — QoS (default: 10) */
  prefetch?: number;
  /** Publisher confirm timeout in ms (default: 5000) */
  publisherConfirmTimeout?: number;
}

export interface ExchangeConfig {
  name: string;
  type: 'direct' | 'topic' | 'fanout' | 'headers';
  durable?: boolean;       // default: true
  autoDelete?: boolean;    // default: false
  internal?: boolean;
  alternateExchange?: string;
}

export interface QueueConfig {
  name: string;
  durable?: boolean;       // default: true
  exclusive?: boolean;
  autoDelete?: boolean;
  /** Milliseconds before unacked message is considered dead */
  messageTtl?: number;
  /** Max queue depth (message count) */
  maxLength?: number;
  /** Max queue size in bytes */
  maxLengthBytes?: number;
  /** Overflow behaviour when maxLength hit */
  overflow?: 'drop-head' | 'reject-publish' | 'reject-publish-dlx';
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  /** Lazy queues store messages on disk */
  lazy?: boolean;
}

export interface RetryConfig {
  /** Max delivery attempts before routing to DLQ (default: 5) */
  maxAttempts?: number;
  /** Initial backoff delay in ms (default: 1000) */
  initialDelay?: number;
  /** Backoff multiplier per attempt (default: 2) */
  multiplier?: number;
  /** Max delay cap in ms (default: 60_000) */
  maxDelay?: number;
  /** Add jitter to avoid thundering herd (default: true) */
  jitter?: boolean;
}

export interface DLQConfig {
  /** Override default DLQ exchange name */
  exchangeName?: string;
  /** Override default DLQ queue name */
  queueName?: string;
  /** Routing key for DLQ */
  routingKey?: string;
  /** TTL for messages sitting in DLQ (ms) */
  messageTtl?: number;
}

export interface PublishOptions {
  routingKey?: string;
  /** Message priority 0-255 */
  priority?: number;
  /** Message expiration TTL (ms as string) */
  expiration?: string;
  headers?: Record<string, unknown>;
  /** Correlation ID for RPC or tracing */
  correlationId?: string;
  /** Queue to reply to (for RPC pattern) */
  replyTo?: string;
  /** Wait for broker confirm before resolving (default: true) */
  mandatory?: boolean;
  /** Persist across broker restarts (default: true) */
  persistent?: boolean;
  /** Custom message ID; auto-generated if omitted */
  messageId?: string;
}

export interface ConsumeOptions {
  /** Consume without requiring ack (default: false) */
  noAck?: boolean;
  /** Consumer tag override */
  consumerTag?: string;
  /** Channel QoS prefetch override */
  prefetch?: number;
}

export interface MessageEnvelope<T = unknown> {
  /** Unique message ID */
  id: string;
  /** ISO-8601 timestamp */
  timestamp: string;
  /** Payload */
  data: T;
  /** Attempt count (1-based) */
  attempt: number;
  /** Originating exchange */
  exchange: string;
  /** Originating routing key */
  routingKey: string;
  /** Correlation ID */
  correlationId?: string;
  /** Custom headers passed through */
  headers: Record<string, unknown>;
  /** Requeue reason (populated on retry) */
  retryReason?: string;
}

export interface ConsumeContext<T = unknown> {
  message: MessageEnvelope<T>;
  /** Acknowledge — removes from queue */
  ack(): void;
  /** Negative-ack — triggers retry/DLQ logic */
  nack(requeue?: boolean): void;
  /** Reject without requeue — goes directly to DLQ */
  reject(): void;
}

export interface HealthStatus {
  connected: boolean;
  reconnecting: boolean;
  reconnectAttempts: number;
  channelCount: number;
  uptime: number;
  lastError?: string;
}


export interface MessageEnvelope<T = unknown> {
  id: string;
  timestamp: string;
    data: T;
    attempt: number;
    exchange: string;
    routingKey: string;
    correlationId?: string;
    headers: Record<string, unknown>;
    retryReason?: string;
}