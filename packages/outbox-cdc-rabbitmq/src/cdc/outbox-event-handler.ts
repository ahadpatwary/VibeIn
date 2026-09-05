import { injectable, singleton } from "tsyringe";
import type { OutboxEventDocument } from "../models/outbox-event.model";
import type { PublishMessage } from "../messaging/rabbitmq-publisher";
import { OutboxSchemaValidationError } from "../errors/outbox.errors";

/**
 * "Handler" stage of Consumer → Handler → Processor: pure transform,
 * no I/O. Keeps the change-stream watcher and the publish/ack logic
 * decoupled from message-shaping concerns.
 */
@injectable()
@singleton()
export class OutboxEventHandler {
  toPublishMessage(doc: OutboxEventDocument): PublishMessage {
    if (!doc.eventId || !doc.eventType || !doc.payload) {
      throw new OutboxSchemaValidationError(undefined, { docId: String(doc._id) });
    }

    return {
      messageId: doc.eventId,
      routingKey: doc.eventType,
      payload: {
        eventId: doc.eventId,
        aggregateType: doc.aggregateType,
        aggregateId: doc.aggregateId,
        eventType: doc.eventType,
        data: doc.payload,
        occurredAt: doc.metadata.occurredAt,
        source: doc.metadata.source,
      },
      correlationId: doc.metadata.correlationId,
      causationId: doc.metadata.causationId,
    };
  }
}
