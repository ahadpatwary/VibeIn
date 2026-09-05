import { injectable, singleton, inject } from "tsyringe";
import type { ChangeStream, ChangeStreamInsertDocument } from "mongodb";
import { OutboxEventModel, type OutboxEventDocument } from "../models/outbox-event.model";
import { CheckpointRepository } from "../repositories/checkpoint.repository";
import { outboxCdcConfig } from "../config/outbox-cdc.config";
import {
  mapChangeStreamError,
  ChangeStreamResumeTokenInvalidError,
} from "../errors/change-stream.errors";
import { DI_TOKENS } from "../di/tokens";

const WATCHER_ID = "outbox_events_watcher";

export type InsertHandler = (doc: OutboxEventDocument) => Promise<void>;

/**
 * "Consumer" stage of the CDC pipeline: opens (or resumes) a MongoDB
 * change stream on the outbox collection and forwards every insert
 * to the provided handler.
 *
 * On ChangeStreamHistoryLost (resume token fell off the oplog), the
 * checkpoint is cleared and the caller is expected to trigger a
 * reconciliation sweep to pick up anything missed during the gap.
 */
@injectable()
@singleton()
export class OutboxChangeStreamWatcher {
  private stream: ChangeStream<OutboxEventDocument> | null = null;
  private stopping = false;

  constructor(
    @inject(CheckpointRepository) private readonly checkpointRepository: CheckpointRepository,
    @inject(DI_TOKENS.Logger) private readonly logger: Console
  ) {}

  async start(onInsert: InsertHandler, onResumeTokenInvalid?: () => Promise<void>): Promise<void> {
    this.stopping = false;
    await this.openStream(onInsert, onResumeTokenInvalid);
  }

  private async openStream(onInsert: InsertHandler, onResumeTokenInvalid?: () => Promise<void>): Promise<void> {
    const resumeToken = await this.checkpointRepository.getResumeToken(WATCHER_ID);

    const pipeline = [{ $match: { operationType: "insert" } }];
    const options: Record<string, unknown> = {
      fullDocument: outboxCdcConfig.changeStream.fullDocument,
    };
    if (resumeToken) {
      options.resumeAfter = resumeToken;
    }

    try {
      this.stream = OutboxEventModel.watch<OutboxEventDocument>(pipeline, options) as unknown as ChangeStream<OutboxEventDocument>;
    } catch (err) {
      throw mapChangeStreamError(err);
    }

    this.stream.on("change", async (change: ChangeStreamInsertDocument<OutboxEventDocument>) => {
      try {
        const doc = change.fullDocument;
        if (!doc) return;

        await onInsert(doc);
        await this.checkpointRepository.saveResumeToken(WATCHER_ID, change._id as unknown as Record<string, unknown>);
      } catch (err) {
        this.logger.error?.("[OutboxChangeStreamWatcher] handler failed for change event", err);
        // Do NOT advance the checkpoint on handler failure — the relay
        // processor is responsible for its own retry/DLQ logic per event;
        // we only skip checkpointing if forwarding to the handler itself threw
        // before the processor could take over the event.
      }
    });

    this.stream.on("error", async (err) => {
      const mapped = mapChangeStreamError(err);
      this.logger.error?.("[OutboxChangeStreamWatcher] stream error", mapped.toLogSafeJSON());

      if (mapped instanceof ChangeStreamResumeTokenInvalidError) {
        await this.checkpointRepository.clearResumeToken(WATCHER_ID);
        await onResumeTokenInvalid?.();
      }

      if (!this.stopping) {
        await this.restartWithBackoff(onInsert, onResumeTokenInvalid);
      }
    });

    this.stream.on("close", async () => {
      if (this.stopping) return;
      this.logger.warn?.("[OutboxChangeStreamWatcher] stream closed unexpectedly — restarting");
      await this.restartWithBackoff(onInsert, onResumeTokenInvalid);
    });

    this.logger.info?.("[OutboxChangeStreamWatcher] watching outbox_events", { resumedFromCheckpoint: !!resumeToken });
  }

  private async restartWithBackoff(onInsert: InsertHandler, onResumeTokenInvalid?: () => Promise<void>): Promise<void> {
    await new Promise((r) => setTimeout(r, 1000 + Math.floor(Math.random() * 2000)));
    if (this.stopping) return;
    await this.openStream(onInsert, onResumeTokenInvalid);
  }

  async stop(): Promise<void> {
    this.stopping = true;
    try {
      await this.stream?.close();
    } catch {
      /* already closed */
    }
    this.stream = null;
  }
}
