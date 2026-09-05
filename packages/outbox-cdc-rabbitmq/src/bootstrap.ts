import "reflect-metadata";
import mongoose from "mongoose";
import { container, registerCoreDependencies } from "./di/container";
import { outboxCdcConfig } from "./config/outbox-cdc.config";
import { RabbitMQConnectionManager } from "./messaging/rabbitmq-connection.manager";
import { OutboxChangeStreamWatcher } from "./cdc/change-stream-watcher";
import { OutboxRelayProcessor } from "./cdc/outbox-relay.processor";
import { OutboxReconciliationJob } from "./reconciliation/outbox-reconciliation.job";
import type { OutboxEventDocument } from "./models/outbox-event.model";

export async function bootstrapOutboxRelay(serviceName: string): Promise<() => Promise<void>> {
  registerCoreDependencies(serviceName);

  const logger = console;

  // 1. Mongo
  await mongoose.connect(outboxCdcConfig.mongo.uri, { dbName: outboxCdcConfig.mongo.dbName });
  logger.info(`[bootstrap] Mongo connected (${outboxCdcConfig.mongo.dbName})`);

  // 2. RabbitMQ
  const connectionManager = container.resolve(RabbitMQConnectionManager);
  await connectionManager.connect();

  // 3. Wire CDC watcher -> processor
  const watcher = container.resolve(OutboxChangeStreamWatcher);
  const processor = container.resolve(OutboxRelayProcessor);
  const reconciliationJob = container.resolve(OutboxReconciliationJob);

  await watcher.start(
    async (doc: OutboxEventDocument) => {
      await processor.process(doc);
    },
    async () => {
      // Resume token invalid -> run an immediate reconciliation sweep
      // to close any gap before the interval-based job would catch it.
      logger.warn("[bootstrap] resume token invalid — running immediate reconciliation sweep");
      await reconciliationJob.runOnce();
    }
  );

  // 4. Safety-net poller
  reconciliationJob.start();

  logger.info("[bootstrap] Outbox CDC -> RabbitMQ relay is live");

  // 5. Graceful shutdown
  const shutdown = async () => {
    logger.info("[bootstrap] shutting down...");
    reconciliationJob.stop();
    await watcher.stop();
    await connectionManager.shutdown();
    await mongoose.disconnect();
    logger.info("[bootstrap] shutdown complete");
  };

  process.once("SIGTERM", () => void shutdown().then(() => process.exit(0)));
  process.once("SIGINT", () => void shutdown().then(() => process.exit(0)));

  return shutdown;
}
