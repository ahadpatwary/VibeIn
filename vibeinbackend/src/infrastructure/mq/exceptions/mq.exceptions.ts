import { RABBITMQ_ERRORS, RabbitMQErrorCode } from '../constants/mq.constants';

import amqp from 'amqplib'
// ─────────────────────────────────────────────────────────────────────────────
// Base exception
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQException extends Error {
  public readonly code: RabbitMQErrorCode;
  public readonly originalError?: Error;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: RabbitMQErrorCode,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'RabbitMQException';
    this.code = code;
    this.originalError = originalError;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name:          this.name,
      message:       this.message,
      code:          this.code,
      context:       this.context,
      originalError: this.originalError?.message,
      stack:         this.stack,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Connection exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQConnectionException extends RabbitMQException {
  constructor(originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ connection failed: ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.CONNECTION_FAILED,
      originalError,
      context,
    );
    this.name = 'RabbitMQConnectionException';
  }
}

export class RabbitMQConnectionClosedException extends RabbitMQException {
  constructor(reason?: string, context?: Record<string, unknown>) {
    super(
      `RabbitMQ connection closed unexpectedly${reason ? `: ${reason}` : ''}`,
      RABBITMQ_ERRORS.CONNECTION_CLOSED,
      undefined,
      context,
    );
    this.name = 'RabbitMQConnectionClosedException';
  }
}

export class RabbitMQConnectionTimeoutException extends RabbitMQException {
  constructor(timeoutMs: number, context?: Record<string, unknown>) {
    super(
      `RabbitMQ connection timed out after ${timeoutMs}ms`,
      RABBITMQ_ERRORS.CONNECTION_TIMEOUT,
      undefined,
      { timeoutMs, ...context },
    );
    this.name = 'RabbitMQConnectionTimeoutException';
  }
}

export class RabbitMQMaxReconnectExceededException extends RabbitMQException {
  public readonly attempts: number;

  constructor(attempts: number, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ reconnect limit reached after ${attempts} attempt${attempts !== 1 ? 's' : ''}`,
      RABBITMQ_ERRORS.MAX_RECONNECT_EXCEEDED,
      originalError,
      { attempts, ...context },
    );
    this.name = 'RabbitMQMaxReconnectExceededException';
    this.attempts = attempts;
  }
}

export class RabbitMQNotInitializedException extends RabbitMQException {
  constructor(hint = 'Call connect() before using this instance.') {
    super(
      `RabbitMQ client is not initialized. ${hint}`,
      RABBITMQ_ERRORS.NOT_INITIALIZED,
    );
    this.name = 'RabbitMQNotInitializedException';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQChannelCreationException extends RabbitMQException {
  public readonly channelName: string;

  constructor(channelName: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ channel '${channelName}' could not be created: ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.CHANNEL_CREATION_FAILED,
      originalError,
      { channelName, ...context },
    );
    this.name = 'RabbitMQChannelCreationException';
    this.channelName = channelName;
  }
}

export class RabbitMQChannelClosedException extends RabbitMQException {
  public readonly channelName: string;

  constructor(channelName: string, reason?: string, context?: Record<string, unknown>) {
    super(
      `RabbitMQ channel '${channelName}' was closed${reason ? `: ${reason}` : ''}`,
      RABBITMQ_ERRORS.CHANNEL_CLOSED,
      undefined,
      { channelName, ...context },
    );
    this.name = 'RabbitMQChannelClosedException';
    this.channelName = channelName;
  }
}

export class RabbitMQChannelNotAvailableException extends RabbitMQException {
  public readonly channelName: string;

  constructor(channelName: string, context?: Record<string, unknown>) {
    super(
      `RabbitMQ channel '${channelName}' is not available. It may have been closed or not yet created.`,
      RABBITMQ_ERRORS.CHANNEL_NOT_AVAILABLE,
      undefined,
      { channelName, ...context },
    );
    this.name = 'RabbitMQChannelNotAvailableException';
    this.channelName = channelName;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Topology exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQExchangeAssertException extends RabbitMQException {
  public readonly exchange: string;

  constructor(exchange: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ exchange assert failed for '${exchange}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.EXCHANGE_ASSERT_FAILED,
      originalError,
      { exchange, ...context },
    );
    this.name = 'RabbitMQExchangeAssertException';
    this.exchange = exchange;
  }
}

export class RabbitMQQueueAssertException extends RabbitMQException {
  public readonly queue: string;

  constructor(queue: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ queue assert failed for '${queue}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.QUEUE_ASSERT_FAILED,
      originalError,
      { queue, ...context },
    );
    this.name = 'RabbitMQQueueAssertException';
    this.queue = queue;
  }
}

export class RabbitMQBindingException extends RabbitMQException {
  public readonly queue: string;
  public readonly exchange: string;
  public readonly routingKey: string;

  constructor(
    queue: string,
    exchange: string,
    routingKey: string,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ binding failed: queue '${queue}' → exchange '${exchange}' (key: '${routingKey}'): ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.BINDING_FAILED,
      originalError,
      { queue, exchange, routingKey, ...context },
    );
    this.name = 'RabbitMQBindingException';
    this.queue = queue;
    this.exchange = exchange;
    this.routingKey = routingKey;
  }
}

export class RabbitMQTopologySetupException extends RabbitMQException {
  public readonly topology: string;

  constructor(topology: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ topology setup failed for '${topology}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.TOPOLOGY_SETUP_FAILED,
      originalError,
      { topology, ...context },
    );
    this.name = 'RabbitMQTopologySetupException';
    this.topology = topology;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Publish exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQPublishException extends RabbitMQException {
  public readonly exchange: string;
  public readonly routingKey: string;

  constructor(
    exchange: string,
    routingKey: string,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ publish failed to exchange '${exchange}' with routing key '${routingKey}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.PUBLISH_FAILED,
      originalError,
      { exchange, routingKey, ...context },
    );
    this.name = 'RabbitMQPublishException';
    this.exchange = exchange;
    this.routingKey = routingKey;
  }
}

export class RabbitMQPublishTimeoutException extends RabbitMQException {
  public readonly exchange: string;
  public readonly routingKey: string;
  public readonly timeoutMs: number;

  constructor(
    exchange: string,
    routingKey: string,
    timeoutMs: number,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ publish to exchange '${exchange}' (key: '${routingKey}') timed out after ${timeoutMs}ms`,
      RABBITMQ_ERRORS.PUBLISH_TIMEOUT,
      undefined,
      { exchange, routingKey, timeoutMs, ...context },
    );
    this.name = 'RabbitMQPublishTimeoutException';
    this.exchange = exchange;
    this.routingKey = routingKey;
    this.timeoutMs = timeoutMs;
  }
}

export class RabbitMQPublisherConfirmNackException extends RabbitMQException {
  public readonly exchange: string;
  public readonly routingKey: string;
  public readonly messageId: string;

  constructor(
    exchange: string,
    routingKey: string,
    messageId: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ broker NACKed message '${messageId}' on exchange '${exchange}' (key: '${routingKey}')`,
      RABBITMQ_ERRORS.PUBLISHER_CONFIRM_NACK,
      undefined,
      { exchange, routingKey, messageId, ...context },
    );
    this.name = 'RabbitMQPublisherConfirmNackException';
    this.exchange = exchange;
    this.routingKey = routingKey;
    this.messageId = messageId;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Consumer exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQConsumerStartException extends RabbitMQException {
  public readonly queue: string;

  constructor(queue: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ consumer failed to start on queue '${queue}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.CONSUMER_START_FAILED,
      originalError,
      { queue, ...context },
    );
    this.name = 'RabbitMQConsumerStartException';
    this.queue = queue;
  }
}

export class RabbitMQConsumerCancelledException extends RabbitMQException {
  public readonly queue: string;
  public readonly consumerTag: string;

  constructor(queue: string, consumerTag: string, context?: Record<string, unknown>) {
    super(
      `RabbitMQ consumer '${consumerTag}' on queue '${queue}' was cancelled by the broker`,
      RABBITMQ_ERRORS.CONSUMER_CANCELLED,
      undefined,
      { queue, consumerTag, ...context },
    );
    this.name = 'RabbitMQConsumerCancelledException';
    this.queue = queue;
    this.consumerTag = consumerTag;
  }
}

export class RabbitMQMessageProcessingException extends RabbitMQException {
  public readonly messageId: string;
  public readonly queue: string;
  public readonly attempt: number;

  constructor(
    messageId: string,
    queue: string,
    attempt: number,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ message '${messageId}' processing failed on queue '${queue}' (attempt ${attempt}): ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.MESSAGE_PROCESSING_FAILED,
      originalError,
      { messageId, queue, attempt, ...context },
    );
    this.name = 'RabbitMQMessageProcessingException';
    this.messageId = messageId;
    this.queue = queue;
    this.attempt = attempt;
  }
}

export class RabbitMQMessageAckException extends RabbitMQException {
  public readonly messageId: string;
  public readonly action: 'ack' | 'nack' | 'reject';

  constructor(
    messageId: string,
    action: 'ack' | 'nack' | 'reject',
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    const code =
      action === 'ack'
        ? RABBITMQ_ERRORS.MESSAGE_ACK_FAILED
        : RABBITMQ_ERRORS.MESSAGE_NACK_FAILED;

    super(
      `RabbitMQ ${action} failed for message '${messageId}': ${originalError?.message ?? 'Unknown error'}`,
      code,
      originalError,
      { messageId, action, ...context },
    );
    this.name = 'RabbitMQMessageAckException';
    this.messageId = messageId;
    this.action = action;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry / DLQ exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQRetryExhaustedException extends RabbitMQException {
  public readonly messageId: string;
  public readonly queue: string;
  public readonly totalAttempts: number;

  constructor(
    messageId: string,
    queue: string,
    totalAttempts: number,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ message '${messageId}' exhausted all ${totalAttempts} retry attempts on queue '${queue}'. Routing to DLQ.`,
      RABBITMQ_ERRORS.RETRY_EXHAUSTED,
      originalError,
      { messageId, queue, totalAttempts, ...context },
    );
    this.name = 'RabbitMQRetryExhaustedException';
    this.messageId = messageId;
    this.queue = queue;
    this.totalAttempts = totalAttempts;
  }
}

export class RabbitMQRetryTopologyException extends RabbitMQException {
  public readonly retryQueue: string;

  constructor(retryQueue: string, originalError?: Error, context?: Record<string, unknown>) {
    super(
      `RabbitMQ retry topology setup failed for queue '${retryQueue}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.RETRY_TOPOLOGY_FAILED,
      originalError,
      { retryQueue, ...context },
    );
    this.name = 'RabbitMQRetryTopologyException';
    this.retryQueue = retryQueue;
  }
}

export class RabbitMQDeadLetterException extends RabbitMQException {
  public readonly messageId: string;
  public readonly dlqQueue: string;

  constructor(
    messageId: string,
    dlqQueue: string,
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ failed to route message '${messageId}' to DLQ '${dlqQueue}': ${originalError?.message ?? 'Unknown error'}`,
      RABBITMQ_ERRORS.DEAD_LETTER_FAILED,
      originalError,
      { messageId, dlqQueue, ...context },
    );
    this.name = 'RabbitMQDeadLetterException';
    this.messageId = messageId;
    this.dlqQueue = dlqQueue;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Serialization exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQSerializationException extends RabbitMQException {
  constructor(
    action: 'serialize' | 'deserialize',
    originalError?: Error,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ ${action} failed: ${originalError?.message ?? 'Unknown error'}`,
      action === 'serialize'
        ? RABBITMQ_ERRORS.SERIALIZATION_ERROR
        : RABBITMQ_ERRORS.DESERIALIZATION_ERROR,
      originalError,
      context,
    );
    this.name = 'RabbitMQSerializationException';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RPC exceptions
// ─────────────────────────────────────────────────────────────────────────────

export class RabbitMQRpcTimeoutException extends RabbitMQException {
  public readonly correlationId: string;
  public readonly routingKey: string;
  public readonly timeoutMs: number;

  constructor(
    correlationId: string,
    routingKey: string,
    timeoutMs: number,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ RPC call '${routingKey}' timed out after ${timeoutMs}ms (correlationId: '${correlationId}')`,
      RABBITMQ_ERRORS.RPC_TIMEOUT,
      undefined,
      { correlationId, routingKey, timeoutMs, ...context },
    );
    this.name = 'RabbitMQRpcTimeoutException';
    this.correlationId = correlationId;
    this.routingKey = routingKey;
    this.timeoutMs = timeoutMs;
  }
}

export class RabbitMQRpcServerException extends RabbitMQException {
  public readonly correlationId: string;
  public readonly routingKey: string;

  constructor(
    correlationId: string,
    routingKey: string,
    serverError: string,
    context?: Record<string, unknown>,
  ) {
    super(
      `RabbitMQ RPC server returned an error for '${routingKey}': ${serverError}`,
      RABBITMQ_ERRORS.RPC_SERVER_ERROR,
      new Error(serverError),
      { correlationId, routingKey, serverError, ...context },
    );
    this.name = 'RabbitMQRpcServerException';
    this.correlationId = correlationId;
    this.routingKey = routingKey;
  }
}

export class RabbitMQRpcNotInitializedException extends RabbitMQException {
  constructor() {
    super(
      'RabbitMQ RPC client is not initialized. Call initialize() first.',
      RABBITMQ_ERRORS.RPC_NOT_INITIALIZED,
    );
    this.name = 'RabbitMQRpcNotInitializedException';
  }
}