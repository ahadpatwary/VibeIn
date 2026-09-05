import { injectable, singleton } from "tsyringe";
import type { ClientSession, FilterQuery } from "mongoose";
import { OutboxEventModel, OutboxEventStatus, type OutboxEventDocument } from "../models/outbox-event.model";
import { mapOutboxError, OutboxEventNotFoundError } from "../errors/outbox.errors";

/**
 * NOTE: if your existing BaseRepository<T> abstraction already covers
 * generic CRUD, this can `extends BaseRepository<OutboxEventDocument>`
 * instead. Kept standalone here so the module is drop-in runnable.
 */
@injectable()
@singleton()
export class OutboxRepository {
  /** Insert an outbox doc as part of an existing Mongo session/transaction. */
  async insertWithinSession(
    data: Pick<OutboxEventDocument, "eventId" | "aggregateType" | "aggregateId" | "eventType" | "payload" | "metadata">,
    session: ClientSession
  ): Promise<OutboxEventDocument> {
    try {
      const [doc] = await OutboxEventModel.create([{ ...data, status: OutboxEventStatus.PENDING }], { session });
      return doc;
    } catch (err) {
      throw mapOutboxError(err, {
        aggregateType: data.aggregateType,
        aggregateId: data.aggregateId,
        eventType: data.eventType,
      });
    }
  }

  async findByEventId(eventId: string): Promise<OutboxEventDocument | null> {
    return OutboxEventModel.findOne({ eventId }).exec();
  }

  async markPublished(eventId: string): Promise<void> {
    const res = await OutboxEventModel.updateOne(
      { eventId, status: { $ne: OutboxEventStatus.PUBLISHED } },
      { $set: { status: OutboxEventStatus.PUBLISHED, publishedAt: new Date() } }
    ).exec();

    if (res.matchedCount === 0) {
      const exists = await this.findByEventId(eventId);
      if (!exists) throw new OutboxEventNotFoundError(eventId);
      // else: already published — treated as idempotent no-op by caller
    }
  }

  async markFailedAttempt(eventId: string, errorMessage: string): Promise<void> {
    await OutboxEventModel.updateOne(
      { eventId },
      { $inc: { retryCount: 1 }, $set: { lastError: errorMessage } }
    ).exec();
  }

  async markPermanentlyFailed(eventId: string, errorMessage: string): Promise<void> {
    await OutboxEventModel.updateOne(
      { eventId },
      { $set: { status: OutboxEventStatus.FAILED, lastError: errorMessage } }
    ).exec();
  }

  /** Safety-net sweep: PENDING docs older than `staleAfterMs` that the change stream may have missed. */
  async findStalePending(staleAfterMs: number, limit: number): Promise<OutboxEventDocument[]> {
    const cutoff = new Date(Date.now() - staleAfterMs);
    const filter: FilterQuery<OutboxEventDocument> = {
      status: OutboxEventStatus.PENDING,
      createdAt: { $lte: cutoff },
    };
    return OutboxEventModel.find(filter).sort({ createdAt: 1 }).limit(limit).exec();
  }
}
