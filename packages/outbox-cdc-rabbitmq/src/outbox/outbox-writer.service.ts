import { randomUUID } from "node:crypto";
import { injectable, singleton, inject } from "tsyringe";
import mongoose, { type ClientSession } from "mongoose";
import { OutboxRepository } from "../repositories/outbox.repository";
import { mapOutboxError, OutboxTransactionAbortedError } from "../errors/outbox.errors";
import { DI_TOKENS } from "../di/tokens";

export interface OutboxEventInput {
  aggregateType: string;
  aggregateId: string;
  eventType: string; // becomes the RabbitMQ routing key, e.g. "order.created"
  payload: Record<string, unknown>;
  correlationId?: string;
  causationId?: string;
}

/**
 * businessWrite receives the active session — every write inside it
 * (and the outbox insert) commits or rolls back together.
 */
export type BusinessWriteFn<T> = (session: ClientSession) => Promise<T>;

@injectable()
@singleton()
export class OutboxWriterService {
  constructor(
    @inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    @inject(DI_TOKENS.ServiceName) private readonly serviceName: string
  ) {}

  /**
   * Runs `businessWrite` and the outbox insert inside a single Mongo
   * multi-document transaction. If anything throws, the whole thing
   * rolls back — the domain write and the event never diverge.
   *
   * `event` can be a static OutboxEventInput, or a builder function
   * that receives the business write's result — useful when the
   * aggregateId (e.g. a freshly generated Mongo _id) is only known
   * AFTER the business write runs, but must still be captured inside
   * the same transaction.
   *
   * Requires a replica set / sharded cluster (transactions are not
   * available on a standalone mongod).
   */
  async writeWithOutbox<T>(
    businessWrite: BusinessWriteFn<T>,
    event: OutboxEventInput | ((result: T) => OutboxEventInput)
  ): Promise<T> {
    const session = await mongoose.startSession();
    const eventId = randomUUID();
    let resolvedEvent!: OutboxEventInput;

    try {
      const result = await session.withTransaction(async () => {
        const businessResult = await businessWrite(session);
        resolvedEvent = typeof event === "function" ? event(businessResult) : event;

        await this.outboxRepository.insertWithinSession(
          {
            eventId,
            aggregateType: resolvedEvent.aggregateType,
            aggregateId: resolvedEvent.aggregateId,
            eventType: resolvedEvent.eventType,
            payload: resolvedEvent.payload,
            metadata: {
              occurredAt: new Date(),
              source: this.serviceName,
              correlationId: resolvedEvent.correlationId,
              causationId: resolvedEvent.causationId,
            },
          },
          session
        );

        return businessResult;
      });

      return result;
    } catch (err) {
      throw err instanceof OutboxTransactionAbortedError
        ? err
        : mapOutboxError(err, {
            aggregateType: resolvedEvent?.aggregateType ?? "unknown",
            aggregateId: resolvedEvent?.aggregateId ?? "unknown",
            eventType: resolvedEvent?.eventType ?? "unknown",
          });
    } finally {
      await session.endSession();
    }
  }
}
