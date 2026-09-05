import { injectable, singleton, inject } from "tsyringe";
import type { OutboxEventDocument } from "../models/outbox-event.model";
import { OutboxEventHandler } from "./outbox-event-handler";
import { RabbitMQPublisher } from "../messaging/rabbitmq-publisher";
import { OutboxRepository } from "../repositories/outbox.repository";
import { OutboxMaxRetriesExceededError, mapOutboxError } from "../errors/outbox.errors";
import { outboxCdcConfig } from "../config/outbox-cdc.config";
import { DI_TOKENS } from "../di/tokens";

/**
 * "Processor" stage: takes a handled message, publishes it to RabbitMQ,
 * and reconciles the outbox doc's status. Used both by the live
 * change-stream path and the reconciliation sweep, so retry/DLQ
 * semantics stay identical for both.
 */
@injectable()
@singleton()
export class OutboxRelayProcessor {
  constructor(
    @inject(OutboxEventHandler) private readonly handler: OutboxEventHandler,
    @inject(RabbitMQPublisher) private readonly publisher: RabbitMQPublisher,
    @inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    @inject(DI_TOKENS.Logger) private readonly logger: Console
  ) {}

  async process(doc: OutboxEventDocument): Promise<void> {
    // Idempotency guard — change stream + reconciliation sweep can both
    // pick up the same doc during a race; PUBLISHED docs are a no-op.
    if (doc.status === "PUBLISHED") return;

    try {
      const message = this.handler.toPublishMessage(doc);
      await this.publisher.publish(message);
      await this.outboxRepository.markPublished(doc.eventId);
      this.logger.info?.("[OutboxRelayProcessor] published", { eventId: doc.eventId, routingKey: doc.eventType });
    } catch (err) {
      await this.handleFailure(doc, err);
    }
  }

  private async handleFailure(doc: OutboxEventDocument, err: unknown): Promise<void> {
    const mapped = mapOutboxError(err, {
      aggregateType: doc.aggregateType,
      aggregateId: doc.aggregateId,
      eventType: doc.eventType,
    });

    const attempts = doc.retryCount + 1;

    if (attempts >= outboxCdcConfig.outboxRetry.maxRetries) {
      const exhausted = new OutboxMaxRetriesExceededError(doc.eventId, attempts, mapped);
      await this.outboxRepository.markPermanentlyFailed(doc.eventId, exhausted.message);
      this.logger.error?.("[OutboxRelayProcessor] max retries exceeded — marked FAILED", exhausted.toLogSafeJSON());
      return;
    }

    await this.outboxRepository.markFailedAttempt(doc.eventId, mapped.message);
    this.logger.warn?.("[OutboxRelayProcessor] publish attempt failed, will retry via reconciliation", {
      eventId: doc.eventId,
      attempts,
      error: mapped.toLogSafeJSON(),
    });
  }
}
