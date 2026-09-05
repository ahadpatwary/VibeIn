import { injectable, singleton, inject } from "tsyringe";
import { outboxCdcConfig } from "../config/outbox-cdc.config";
import { RabbitMQConnectionManager } from "./rabbitmq-connection.manager";
import {
  mapRabbitMQError,
  RabbitMQPublishNackedError,
  RabbitMQPublishTimeoutError,
  RabbitMQSerializationError,
} from "../errors/rabbitmq.errors";
import { retryWithBackoff } from "../utils/retry-with-backoff";

export interface PublishMessage {
  messageId: string; // = outbox eventId -> lets consumers dedupe idempotently
  routingKey: string; // = outbox eventType, e.g. "order.created"
  payload: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

@injectable()
@singleton()
export class RabbitMQPublisher {
  constructor(@inject(RabbitMQConnectionManager) private readonly connectionManager: RabbitMQConnectionManager) {}

  /**
   * Publishes with publisher-confirms: resolves only once the broker
   * ACKs the message, rejects on NACK/timeout. Retries transient
   * failures with full-jitter backoff; non-retryable errors bubble up
   * immediately (e.g. serialization, exchange mismatch).
   */
  async publish(message: PublishMessage): Promise<void> {
    const { maxRetries, baseDelayMs, maxDelayMs } = outboxCdcConfig.outboxRetry;

    await retryWithBackoff(() => this.publishOnce(message), {
      maxRetries,
      baseDelayMs,
      maxDelayMs,
      isRetryable: (err) => (err as { retryable?: boolean })?.retryable !== false,
      onRetry: (attempt, delayMs, err) => {
        console.warn(`[RabbitMQPublisher] retry #${attempt} in ${delayMs}ms for "${message.routingKey}"`, err);
      },
    });
  }

  private async publishOnce(message: PublishMessage): Promise<void> {
    let buffer: Buffer;
    try {
      buffer = Buffer.from(JSON.stringify(message.payload));
    } catch (err) {
      throw new RabbitMQSerializationError(err);
    }

    const channel = this.connectionManager.getChannel();

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new RabbitMQPublishTimeoutError(message.routingKey));
      }, outboxCdcConfig.rabbitmq.publisherConfirmTimeoutMs);

      try {
        channel.publish(
          outboxCdcConfig.rabbitmq.exchange,
          message.routingKey,
          buffer,
          {
            persistent: true,
            messageId: message.messageId, // idempotency key for consumers
            correlationId: message.correlationId,
            headers: { causationId: message.causationId ?? null },
            contentType: "application/json",
          },
          (err: Error) => {
            clearTimeout(timeout);
            if (err) {
              reject(new RabbitMQPublishNackedError(message.routingKey));
            } else {
              resolve();
            }
          }
        );
      } catch (err) {
        clearTimeout(timeout);
        reject(mapRabbitMQError(err, message.routingKey));
      }
    });
  }
}
