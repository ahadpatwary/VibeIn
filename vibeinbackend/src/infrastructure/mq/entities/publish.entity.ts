import * as amqp from 'amqplib';
import { ChannelManager } from './channel.entity';
import { MessageSerializer } from '../utils/mq.serializer';
import { ExchangeConfig, PublishOptions, MessageEnvelope } from '../types/mq.types';
import { RabbitMqLogger, Logger } from '../utils/mq.logger';

export abstract class BasePublisher {
  protected readonly logger: Logger;
  private ch: amqp.ConfirmChannel | null = null;

  constructor(
    protected readonly channelManager: ChannelManager,
    protected readonly exchange: ExchangeConfig,
  ) {
    this.logger = new RabbitMqLogger();
  }

  // ─── Setup ───────────────────────────────────────────────

  /**
   * Call once during application start-up.
   * Asserts the exchange so topology is ready before first publish.
   */
  async initialize(): Promise<void> {
    const ch = await this.getChannel();
    await this.channelManager.assertExchange(ch, this.exchange);
    this.logger.info('Publisher initialised', { exchange: this.exchange.name });
  }

  // ─── Core publish ────────────────────────────────────────

  /**
   * Publish a single message with publisher confirms.
   * Resolves when the broker ACKs the message (guarantee of receipt).
   */
  async publish<T>(
    data: T,
    routingKey: string,
    opts: PublishOptions = {},
  ): Promise<MessageEnvelope<T>> {
    const ch = await this.getChannel();

    const { buffer, envelope } = MessageSerializer.serialize(data, this.exchange.name, routingKey, {
      correlationId: opts.correlationId,
      headers:       opts.headers ?? {},
    });

    const amqpOpts: amqp.Options.Publish = {
      persistent:    opts.persistent    ?? true,     // survives broker restart
      messageId:     opts.messageId     ?? envelope.id,
      correlationId: opts.correlationId,
      replyTo:       opts.replyTo,
      priority:      opts.priority,
      expiration:    opts.expiration,
      timestamp:     Date.now(),
      contentType:   'application/json',
      contentEncoding: 'utf-8',
      headers:       {
        ...opts.headers,
        'x-message-id':   envelope.id,
        'x-published-at': envelope.timestamp,
      },
    };

    await this.publishWithConfirm(ch, this.exchange.name, routingKey, buffer, amqpOpts);

    this.logger.debug('Message published', {
      exchange:   this.exchange.name,
      routingKey,
      messageId:  envelope.id,
    });

    return envelope;
  }

  /**
   * Publish multiple messages in sequence, collecting results.
   * Failed publishes are included in the returned errors array.
   */
  async publishBatch<T>(
    items: Array<{ data: T; routingKey: string; opts?: PublishOptions }>,
  ): Promise<{
    published: Array<MessageEnvelope<T>>;
    errors:    Array<{ item: (typeof items)[0]; error: Error }>;
  }> {
    const published: Array<MessageEnvelope<T>> = [];
    const errors: Array<{ item: (typeof items)[0]; error: Error }> = [];

    for (const item of items) {
      try {
        const env = await this.publish(item.data, item.routingKey, item.opts);
        published.push(env);
      } catch (err) {
        errors.push({ item, error: err instanceof Error ? err : new Error(String(err)) });
      }
    }

    this.logger.info('Batch publish complete', {
      total: items.length, published: published.length, failed: errors.length,
    });

    return { published, errors };
  }

  // ─── Internal helpers ────────────────────────────────────

  private async publishWithConfirm(
    ch: amqp.ConfirmChannel,
    exchange: string,
    routingKey: string,
    content: Buffer,
    opts: amqp.Options.Publish,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const ok = ch.publish(exchange, routingKey, content, opts,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );

      if (!ok) {
        this.logger.warn('Write buffer full');

        ch.once('drain', () => {
          this.logger.debug('Drain emitted');
        });
      }
    });

  }

  private async getChannel(): Promise<amqp.ConfirmChannel> {
    if (!this.ch) {
      this.ch = await this.channelManager.getChannel(`publisher:${this.exchange.name}`);
    }
    return this.ch;
  }

  async close(): Promise<void> {
    await this.channelManager.closeChannel(`publisher:${this.exchange.name}`);
    this.ch = null;
  }
}

// ─── Usage example ───────────────────────────────────────────────────────────
//
//  export class OrderPublisher extends BasePublisher {
//    constructor(channelManager: ChannelManager) {
//      super(channelManager, {
//        name:    'orders',
//        type:    'topic',
//        durable: true,
//      });
//    }
//
//    async publishOrderCreated(order: Order): Promise<void> {
//      await this.publish(order, 'order.created');
//    }
//
//    async publishOrderShipped(order: Order): Promise<void> {
//      await this.publish(order, 'order.shipped');
//    }
//  }