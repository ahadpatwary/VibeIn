import { AppError } from "./app-error.base";

const NAMESPACE = "RMQ";

export abstract class RabbitMQError extends AppError {
  readonly namespace = NAMESPACE;
}

export class RabbitMQConnectionError extends RabbitMQError {
  readonly code = "CONNECTION_FAILED";
  readonly retryable = true;

  constructor(cause?: unknown) {
    super("Failed to establish RabbitMQ connection", { cause });
  }
}

export class RabbitMQChannelError extends RabbitMQError {
  readonly code = "CHANNEL_ERROR";
  readonly retryable = true;

  constructor(cause?: unknown) {
    super("RabbitMQ channel error", { cause });
  }
}

export class RabbitMQPublishTimeoutError extends RabbitMQError {
  readonly code = "PUBLISH_CONFIRM_TIMEOUT";
  readonly retryable = true;

  constructor(routingKey: string) {
    super(`Publisher confirm timed out for routing key "${routingKey}"`, { context: { routingKey } });
  }
}

export class RabbitMQPublishNackedError extends RabbitMQError {
  readonly code = "PUBLISH_NACKED";
  readonly retryable = true;

  constructor(routingKey: string) {
    super(`Broker NACKed publish for routing key "${routingKey}" (broker rejected — check disk alarm/flow control)`, {
      context: { routingKey },
    });
  }
}

export class RabbitMQExchangeMismatchError extends RabbitMQError {
  readonly code = "EXCHANGE_MISMATCH";
  readonly retryable = false;

  constructor(exchange: string, cause?: unknown) {
    super(`Exchange "${exchange}" declared with conflicting options (type/durability mismatch)`, {
      cause,
      context: { exchange },
    });
  }
}

export class RabbitMQSerializationError extends RabbitMQError {
  readonly code = "SERIALIZATION_FAILED";
  readonly retryable = false;

  constructor(cause?: unknown) {
    super("Failed to serialize message payload for publish", { cause });
  }
}

/** Mirrors mapRedisError() / mapKafkaError() — translates amqplib errors into typed hierarchy. */
export function mapRabbitMQError(err: unknown, routingKey?: string): RabbitMQError {
  if (err instanceof RabbitMQError) return err;

  const amqpErr = err as { code?: number; message?: string };
  const msg = amqpErr?.message?.toLowerCase() ?? "";

  if (msg.includes("econnrefused") || msg.includes("socket closed") || msg.includes("connect")) {
    return new RabbitMQConnectionError(err);
  }

  if (msg.includes("channel closed") || msg.includes("precondition failed")) {
    return new RabbitMQChannelError(err);
  }

  if (msg.includes("406") || msg.includes("not_acceptable") || (routingKey && msg.includes("exchange"))) {
    return new RabbitMQExchangeMismatchError(routingKey ?? "unknown", err);
  }

  return new RabbitMQChannelError(err);
}
