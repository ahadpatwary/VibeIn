import * as amqp from 'amqplib';
import { BackoffStrategy, DEFAULT_RETRY_CONFIG } from './backoffStrategy.entity';
import { MessageSerializer } from '../utils/mq.serializer';
import { ChannelManager } from './channel.entity';
import {
  ExchangeConfig,
  QueueConfig,
  RetryConfig,
  DLQConfig,
  ConsumeOptions,
  ConsumeContext,
  MessageEnvelope,
} from '../types/mq.types';
import { RabbitMqLogger, Logger } from '../utils/mq.logger';

export interface ConsumerSetupOptions {
  exchange:     ExchangeConfig;
  queue:        QueueConfig;
  routingKeys:  string[];         // bindings between exchange ↔ queue
  retry?:       RetryConfig;
  dlq?:         Partial<DLQConfig>;
  consume?:     ConsumeOptions;
}

export abstract class BaseConsumer<T = unknown> {
  protected readonly logger: Logger;
  private consumerTag: string | null = null;
  private readonly backoff: BackoffStrategy;
  private readonly dlqCfg: Required<DLQConfig>;
  private readonly retryCfg: Required<RetryConfig>;
  private shuttingDown = false;
  private activeMessages = 0;
  private drainResolvers: Array<() => void> = [];

  constructor(
    protected readonly channelManager: ChannelManager,
    protected readonly opts: ConsumerSetupOptions,
  ) {
    this.logger = new RabbitMqLogger();

    // Merge retry config with defaults
    this.retryCfg = { ...DEFAULT_RETRY_CONFIG, ...opts.retry };
    this.backoff   = new BackoffStrategy(this.retryCfg);

    // DLQ naming convention: <queue>-dlq
    const base = opts.queue.name;
    this.dlqCfg = {
      exchangeName: opts.dlq?.exchangeName ?? `${base}.dlx`,
      queueName:    opts.dlq?.queueName    ?? `${base}.dlq`,
      routingKey:   opts.dlq?.routingKey   ?? `${base}.dead`,
      messageTtl:   opts.dlq?.messageTtl   ?? 0,     // 0 = never expire
    };
  }

  // ─── Abstract ─────────────────────────────────────────────

  /**
   * Business logic. Throw to trigger retry/DLQ.
   * Do NOT call ack/nack yourself — the base class handles it.
   */
  protected abstract handle(ctx: ConsumeContext<T>): Promise<void>;

  /**
   * Called when a message is routed to DLQ after exhausting retries.
   * Override for alerting, metrics, etc.
   */
  protected async onDeadLetter(
    message: MessageEnvelope<T>,
    finalError: Error,
  ): Promise<void> {
    this.logger.error('Message sent to DLQ', {
      messageId:  message.id,
      attempt:    message.attempt,
      exchange:   message.exchange,
      routingKey: message.routingKey,
      error:      finalError.message,
      dlqQueue:   this.dlqCfg.queueName,
    });
  }

  // ─── Setup ───────────────────────────────────────────────

  async initialize(): Promise<void> {
    const ch = await this.channelManager.getChannel(`consumer:${this.opts.queue.name}`);

    // Build DLQ + main topology
    await this.channelManager.setupDeadLetterTopology(
      ch,
      this.opts.exchange,
      this.opts.queue,
      this.dlqCfg,
    );

    // Bind routing keys
    for (const rk of this.opts.routingKeys) {
      await ch.bindQueue(this.opts.queue.name, this.opts.exchange.name, rk);
      this.logger.debug('Queue bound', { queue: this.opts.queue.name, routingKey: rk });
    }

    this.logger.info('Consumer topology ready', {
      exchange: this.opts.exchange.name,
      queue:    this.opts.queue.name,
      dlq:      this.dlqCfg.queueName,
    });
  }

  // ─── Start consuming ─────────────────────────────────────

  async start(): Promise<void> {
    const ch = await this.channelManager.getChannel(`consumer:${this.opts.queue.name}`);

    // Per-consumer prefetch override
    if (this.opts.consume?.prefetch) {
      await ch.prefetch(this.opts.consume.prefetch);
    }

    const consumeReply = await ch.consume( this.opts.queue.name, (msg) => {
        if (msg) void this.onMessage(ch, msg);
      },
      {
        noAck:       this.opts.consume?.noAck       ?? false,
        consumerTag: this.opts.consume?.consumerTag,
      },
    );

    this.consumerTag = consumeReply.consumerTag;
    this.logger.info('Consumer started', {
      queue:       this.opts.queue.name,
      consumerTag: this.consumerTag,
    });
  }

  // ─── Graceful shutdown ───────────────────────────────────

  /**
   * Stop accepting new messages and wait for in-flight messages to finish.
   * @param timeoutMs Max wait before force-closing (default 30 s)
   */
  async stop(timeoutMs = 30_000): Promise<void> {
    this.shuttingDown = true;

    if (this.consumerTag) {
      const ch = await this.channelManager.getChannel(`consumer:${this.opts.queue.name}`).catch(() => null);
      if (ch) {
        await ch.cancel(this.consumerTag).catch(() => undefined);
      }
      this.consumerTag = null;
    }

    if (this.activeMessages > 0) {
      this.logger.info('Waiting for in-flight messages…', { count: this.activeMessages });

      await Promise.race([
        new Promise<void>(resolve => this.drainResolvers.push(resolve)),
        new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
      ]);
    }

    this.logger.info('Consumer stopped');
  }

  // ─── Internal message pipeline ───────────────────────────

  private async onMessage(ch: amqp.ConfirmChannel, msg: amqp.ConsumeMessage): Promise<void> {
    this.activeMessages++;

    let envelope: MessageEnvelope<T>;

    try {
      envelope = MessageSerializer.deserialize<T>(msg);
    } catch (parseErr) {
      // Unparseable message → straight to DLQ, never retry
      this.logger.error('Unparseable message — routing to DLQ', {
        error: (parseErr as Error).message,
      });
      ch.nack(msg, false, false); //DLQ via x-dead-letter-exchange
      this.decrementActive();
      return;
    }

    this.logger.debug('Message received', {
      messageId:  envelope.id,
      attempt:    envelope.attempt,
      routingKey: msg.fields.routingKey,
    });

    let lastError: Error = new Error('Unknown error');

    try {
      // Build the context object for the handler
      let settled = false;

      const ctx: ConsumeContext<T> = {
        message: envelope,
        ack:    () => { if (!settled) { settled = true; ch.ack(msg); } },
        nack:   (requeue = false) => {
          if (!settled) {
            settled = true;
            ch.nack(msg, false, requeue);
          }
        },
        reject: () => {
          if (!settled) {
            settled = true;
            ch.nack(msg, false, false);   // → DLQ via x-dead-letter-exchange
          }
        },
      };

      await this.handle(ctx);

      // If handler didn't call ack/nack, auto-ack (success path)
      if (!settled) {
        ch.ack(msg);
        this.logger.debug('Message ACKed', { messageId: envelope.id });
      }

      this.decrementActive();
      return;

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      this.logger.warn('Message handler threw', {
        messageId: envelope.id,
        attempt:   envelope.attempt,
        error:     lastError.message,
      });
    }

    // ── Retry / DLQ decision ─────────────────────────────────

    if (this.backoff.shouldGiveUp(envelope.attempt)) {
      // Max attempts exhausted → route to DLQ
      await this.onDeadLetter(envelope, lastError);
      ch.nack(msg, false, false);   // broker dead-letters it via x-dead-letter-exchange
    } else {
      // Schedule a retry using a per-delay TTL queue (delayed requeue pattern)
      await this.scheduleRetry(ch, msg, envelope, lastError);
    }

    this.decrementActive();
  }

  /**
   * Publish message to a retry queue with TTL = backoff delay.
   * When TTL expires the broker re-routes it to the main exchange.
   */
  private async scheduleRetry(
    ch: amqp.ConfirmChannel,
    original: amqp.ConsumeMessage,
    envelope: MessageEnvelope<T>,
    reason: Error,
  ): Promise<void> {
    const nextAttempt = envelope.attempt + 1;
    const delayMs     = this.backoff.getDelay(nextAttempt);

    const retryExchange = `${this.opts.exchange.name}.retry`;
    const retryQueue    = `${this.opts.queue.name}.retry.${delayMs}ms`;
    const routingKey    = original.fields.routingKey;

    // Ensure the per-delay retry queue exists (idempotent assert)
    try {
      await this.channelManager.setupRetryTopology(
        ch,
        this.opts.exchange,
        routingKey,
        retryExchange,
        retryQueue,
        delayMs,
      );
    } catch (topologyErr) {
      // If topology setup fails don't lose the message — nack with requeue
      this.logger.error('Retry topology setup failed, requeuing', {
        error: (topologyErr as Error).message,
      });
      ch.nack(original, false, true);
      return;
    }

    // Build updated envelope with incremented attempt count
    const retryEnvelope: MessageEnvelope<T> = {
      ...envelope,
      attempt:     nextAttempt,
      retryReason: reason.message,
      headers:     {
        ...envelope.headers,
        'x-retry-attempt': nextAttempt,
        'x-retry-reason':  reason.message,
        'x-retry-delay-ms': delayMs,
      },
    };

    const content = Buffer.from(JSON.stringify(retryEnvelope));

    await new Promise<void>((resolve, reject) => {
      ch.publish(
        retryExchange,
        routingKey,
        content,
        {
          persistent: true,
          headers:    retryEnvelope.headers as Record<string, unknown>,
          messageId:  retryEnvelope.id,
          timestamp:  Date.now(),
          contentType: 'application/json',
        },
        (err) => (err ? reject(err) : resolve()),
      );
    });

    // ACK the original — we've taken responsibility for the retry
    ch.ack(original);

    this.logger.info('Message scheduled for retry', {
      messageId:   envelope.id,
      nextAttempt,
      delayMs,
      retryQueue,
    });
  }

  private decrementActive(): void {
    this.activeMessages--;
    if (this.activeMessages === 0 && this.shuttingDown) {
      this.drainResolvers.forEach(r => r());
      this.drainResolvers = [];
    }
  }
}

// ─── Usage example ────────────────────────────────────────────────────────────
//
//  interface OrderPayload { orderId: string; amount: number; }
//
//  export class OrderConsumer extends BaseConsumer<OrderPayload> {
//    constructor(channelManager: ChannelManager) {
//      super(channelManager, {
//        exchange:    { name: 'orders', type: 'topic', durable: true },
//        queue:       { name: 'orders.processing' },
//        routingKeys: ['order.created', 'order.updated'],
//        retry:       { maxAttempts: 5, initialDelay: 2000 },
//      });
//    }
//
//    protected async handle(ctx: ConsumeContext<OrderPayload>): Promise<void> {
//      const { message } = ctx;
//      await processOrder(message.data);   // your business logic
//      ctx.ack();
//    }
//
//    protected async onDeadLetter(msg: MessageEnvelope<OrderPayload>, err: Error) {
//      await super.onDeadLetter(msg, err);
//      await alertOpsTeam(msg, err);      // custom hook
//    }
//  }