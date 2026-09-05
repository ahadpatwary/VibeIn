import { injectable, singleton, inject } from "tsyringe";
import amqplib, { type ConfirmChannel, type ChannelModel } from "amqplib";
import { outboxCdcConfig } from "../config/outbox-cdc.config";
import { mapRabbitMQError, RabbitMQConnectionError } from "../errors/rabbitmq.errors";
import { DI_TOKENS } from "../di/tokens";

type ConnectionState = "disconnected" | "connecting" | "connected" | "shutting_down";

/**
 * Owns exactly one AMQP connection + one confirm channel for the whole
 * process. Mirrors RedisClientManager: singleton, explicit lifecycle,
 * auto-reconnect with exponential backoff + jitter.
 */
@injectable()
@singleton()
export class RabbitMQConnectionManager {
  private connectionModel: ChannelModel | null = null;
  private confirmChannel: ConfirmChannel | null = null;
  private state: ConnectionState = "disconnected";
  private reconnectAttempt = 0;

  constructor(@inject(DI_TOKENS.Logger) private readonly logger: Console) {}

  async connect(): Promise<void> {
    if (this.state === "connected" || this.state === "connecting") return;
    this.state = "connecting";

    try {
      this.connectionModel = await amqplib.connect(outboxCdcConfig.rabbitmq.url);
      this.confirmChannel = await this.connectionModel.createConfirmChannel();

      await this.confirmChannel.assertExchange(
        outboxCdcConfig.rabbitmq.exchange,
        outboxCdcConfig.rabbitmq.exchangeType,
        { durable: true }
      );

      this.connectionModel.on("error", (err) => this.handleConnectionError(err));
      this.connectionModel.on("close", () => this.handleConnectionClose());

      this.state = "connected";
      this.reconnectAttempt = 0;
      this.logger.info?.("[RabbitMQConnectionManager] connected", { exchange: outboxCdcConfig.rabbitmq.exchange });
    } catch (err) {
      this.state = "disconnected";
      throw mapRabbitMQError(err);
    }
  }

  getChannel(): ConfirmChannel {
    if (!this.confirmChannel || this.state !== "connected") {
      throw new RabbitMQConnectionError(new Error("Channel requested while disconnected"));
    }
    return this.confirmChannel;
  }

  isConnected(): boolean {
    return this.state === "connected";
  }

  private handleConnectionError(err: unknown): void {
    this.logger.error?.("[RabbitMQConnectionManager] connection error", mapRabbitMQError(err).toLogSafeJSON());
  }

  private handleConnectionClose(): void {
    if (this.state === "shutting_down") return;
    this.state = "disconnected";
    this.logger.warn?.("[RabbitMQConnectionManager] connection closed — scheduling reconnect");
    void this.scheduleReconnect();
  }

  private async scheduleReconnect(): Promise<void> {
    const { reconnectBaseDelayMs, reconnectMaxDelayMs } = outboxCdcConfig.rabbitmq;
    const delay = Math.min(reconnectMaxDelayMs, reconnectBaseDelayMs * 2 ** this.reconnectAttempt);
    const jittered = Math.floor(Math.random() * delay);
    this.reconnectAttempt += 1;

    await new Promise((resolve) => setTimeout(resolve, jittered));

    try {
      await this.connect();
    } catch {
      void this.scheduleReconnect();
    }
  }

  async shutdown(): Promise<void> {
    this.state = "shutting_down";
    try {
      await this.confirmChannel?.close();
    } catch {
      /* channel may already be closed */
    }
    try {
      await this.connectionModel?.close();
    } catch {
      /* connection may already be closed */
    }
    this.confirmChannel = null;
    this.connectionModel = null;
    this.logger.info?.("[RabbitMQConnectionManager] shut down gracefully");
  }
}
