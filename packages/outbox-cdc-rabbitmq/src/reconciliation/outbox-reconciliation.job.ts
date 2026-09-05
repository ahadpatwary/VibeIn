import { injectable, singleton, inject } from "tsyringe";
import { OutboxRepository } from "../repositories/outbox.repository";
import { OutboxRelayProcessor } from "../cdc/outbox-relay.processor";
import { outboxCdcConfig } from "../config/outbox-cdc.config";
import { DI_TOKENS } from "../di/tokens";

/**
 * Change streams are near-real-time but not a substitute for a
 * safety net: process crashes, a resume-token gap, or a handler
 * exception can all leave a PENDING doc unpublished. This job
 * polls for stale PENDING docs on an interval and re-drives them
 * through the same processor used by the live CDC path — so retry
 * counters and FAILED/DLQ semantics stay consistent either way.
 */
@injectable()
@singleton()
export class OutboxReconciliationJob {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(

    @inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    @inject(OutboxRelayProcessor) private readonly processor: OutboxRelayProcessor,
    @inject(DI_TOKENS.Logger) private readonly logger: Console
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => void this.runOnce(), outboxCdcConfig.reconciliation.intervalMs);
    this.logger.info?.("[OutboxReconciliationJob] started", {
      intervalMs: outboxCdcConfig.reconciliation.intervalMs,
    });
  }

  async runOnce(): Promise<void> {
    if (this.running) return; // prevent overlapping sweeps if one run takes longer than the interval
    this.running = true;

    try {
      const stale = await this.outboxRepository.findStalePending(
        outboxCdcConfig.reconciliation.staleAfterMs,
        outboxCdcConfig.reconciliation.batchSize
      );

      if (stale.length > 0) {
        this.logger.warn?.(`[OutboxReconciliationJob] found ${stale.length} stale pending event(s)`);
      }

      for (const doc of stale) {
        await this.processor.process(doc);
      }
    } catch (err) {
      this.logger.error?.("[OutboxReconciliationJob] sweep failed", err);
    } finally {
      this.running = false;
    }
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
