import amqp, { RecoveryOptions, SocketOptions, Options, ChannelOptions, MessagePropertyHeaders } from 'amqplib';

export type RabbitMqConnectionOptions = Omit<
    Required<Options.Connect>,
    'locale' | 'frameMax' | 'vhost' | 'credentials'
>;

export type RabbitMqRecoverAndSocketOptions = Required<
    Omit<SocketOptions, 'clientProperties' | 'credentials'> & {
        recovery: Required<Omit<RecoveryOptions, 'setup'> | true>;
    }
>;

export interface MessageHeaders {
    'x-retry-count': number;
    'x-max-retry': number;
    'x-last-error': string;
    'x-last-process-time': number;
    [key: string]: any;
}

export interface consumerSideMessageHearders 
    extends 
        MessageHeaders,
        MessagePropertyHeaders {}

;

// type RabbitMQAllConfig =  SocketOptions & RecoveryOptions & Options.Connect;

type OptionalRabbitOpts = Partial<
    Pick<RabbitMqConnectionOptions, 'heartbeat' | 'channelMax'>
>;
type RequiredSocketOpts = Partial<
    Omit<SocketOptions, 'clientProperties' | 'credentials'>
>;
type RequiredRecoveryOpts = Partial<Omit<RecoveryOptions, 'setup'>>;
export type RequiredRabbitOpts = Required<
    Omit<RabbitMqConnectionOptions, 'heartbeat' | 'channelMax'>
>;

export interface RabbitMQConfig
    extends
        OptionalRabbitOpts,
        RequiredSocketOpts,
        RequiredRecoveryOpts,
        RequiredRabbitOpts {}

export interface ExchangeConfig {
    name: string;
    type: 'direct' | 'topic' | 'fanout' | 'headers';
    durable?: boolean; // default: true
    autoDelete?: boolean; // default: false
    internal?: boolean;
    alternateExchange?: string;
}
export type channelOptions = ChannelOptions & {
    name: string;
    prefetch: number;
};

// type assertQueueRequiredOptions = Required<
//     Pick<Options.AssertQueue & Partial<{ maxLengthBytes: string, lazy: boolean}>, 'messageTtl' | 'deadLetterExchange' | 'deadLetterRoutingKey'>
// >;
// type assertQueueOptionalOptions = Omit<Options.AssertQueue & Partial<{ maxLengthBytes: string, lazy: boolean}>, 'messageTtl'| 'deadLetterExchange' | 'deadLetterRoutingKey'>

// export interface RTAssertQueueOptions
//     extends assertQueueRequiredOptions, assertQueueOptionalOptions {}
// ;

// type assertQueueRequiredOptionsForMain = Required<
//     Pick<Options.AssertQueue & Partial<{ maxLengthBytes: string, lazy: boolean}>, 'deadLetterExchange' | 'deadLetterRoutingKey'>
// >;

// type assertQueueOptionalOptionsForMain = Omit<Options.AssertQueue & Partial<{ maxLengthBytes: string, lazy: boolean}>, 'deadLetterExchange' | 'deadLetterRoutingKey'>

// export interface RTAssertQueueOptionsForMain
//     extends assertQueueRequiredOptionsForMain, assertQueueOptionalOptionsForMain {}
// ;

// মেইন কিউ এর জন্য যখন DLX লাগবে (REQUIRED)
export interface RTAssertQueueOptionsForMain extends amqp.Options.AssertQueue {
    deadLetterExchange: string; // এটি অবশ্যই থাকতে হবে
    deadLetterRoutingKey: string; // এটিও অবশ্যই থাকতে হবে
}

// রিট্রাই কিউ এর জন্য (REQUIRED to route back to Main Exchange)
export interface RTAssertQueueOptions extends amqp.Options.AssertQueue {
    messageTtl: number; // রিট্রাই কিউতে TTL থাকা বাধ্যতামূলক
    deadLetterExchange: string; // মেসেজ ড্রপ হলে মেইন এক্সচেঞ্জে ফেরত যাবে
    deadLetterRoutingKey: string; // মেইন কিউয়ের রাউটিং কি
}

export interface QueueConfig {
    name: string;
    durable?: boolean; // default: true
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

export type requiredOptions = Required<
    Pick<
        Options.Publish,
        'userId' | 'replyTo' | 'type' | 'contentType' | 'timestamp'
    >
>;
export type optionalOptions = Partial<
    Omit<
        Options.Publish,
        'userId' | 'replyTo' | 'type' | 'contentType' | 'timestamp'
    >
>;

export interface PublishOptions extends requiredOptions, optionalOptions {}

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
