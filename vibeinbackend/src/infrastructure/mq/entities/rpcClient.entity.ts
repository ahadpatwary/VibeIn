// RPC over RabbitMQ — publish to a request queue, await reply on an exclusive reply-to queue. Uses correlationId matching.


import * as amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import { ChannelManager } from './channel.entity';
import { RabbitMqLogger, Logger } from '../utils/mq.logger';

interface PendingRpc<R> {
  resolve: (result: R) => void;
  reject:  (err: Error)   => void;
  timeout: NodeJS.Timeout;
}

export class BaseRpcClient {
  protected readonly logger: Logger;
  private ch:          amqp.ConfirmChannel | null = null;
  private replyQueue:  string | null = null;
  private readonly pending = new Map<string, PendingRpc<unknown>>();

  constructor(
    protected readonly channelManager: ChannelManager,
    protected readonly requestExchange: string,
    protected readonly defaultTimeoutMs = 10_000,
  ) {
    this.logger = new RabbitMqLogger();
  }

  async initialize(): Promise<void> {
    this.ch = await this.channelManager.getChannel(`rpc:${this.requestExchange}`);

    // Exclusive, auto-delete reply queue — unique per client instance
    const { queue } = await this.ch.assertQueue('', { exclusive: true, autoDelete: true });
    this.replyQueue = queue;

    // Start listening on reply queue
    await this.ch.consume(
      this.replyQueue,
      (msg) => { if (msg) this.handleReply(msg); },
      { noAck: true },
    );

    this.logger.info('RPC client ready', {
      exchange:   this.requestExchange,
      replyQueue: this.replyQueue,
    });
  }

  /**
   * Send a request and await the correlated reply.
   * @param routingKey   Target RPC server routing key
   * @param payload      Request payload
   * @param timeoutMs    Override default timeout
   */
  async call<Req, Res>(
    routingKey: string,
    payload: Req,
    timeoutMs = this.defaultTimeoutMs,
  ): Promise<Res> {
    if (!this.ch || !this.replyQueue) {
      throw new Error('RpcClient not initialised — call initialize() first');
    }

    const correlationId = uuidv4();
    const content       = Buffer.from(JSON.stringify(payload));

    return new Promise<Res>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(correlationId);
        reject(new Error(`RPC timeout after ${timeoutMs}ms (correlationId=${correlationId})`));
      }, timeoutMs);

      this.pending.set(correlationId, {
        resolve: resolve as (r: unknown) => void,
        reject,
        timeout,
      });

      this.ch!.publish(
        this.requestExchange,
        routingKey,
        content,
        {
          correlationId,
          replyTo:     this.replyQueue!,
          persistent:  false,    // RPC messages can be transient
          timestamp:   Date.now(),
          contentType: 'application/json',
        },
        (err) => {
          if (err) {
            clearTimeout(timeout);
            this.pending.delete(correlationId);
            reject(err);
          }
        },
      );

      this.logger.debug('RPC request sent', { correlationId, routingKey });
    });
  }

  private handleReply(msg: amqp.ConsumeMessage): void {
    const correlationId = msg.properties.correlationId as string | undefined;
    if (!correlationId) return;

    const pending = this.pending.get(correlationId);
    if (!pending) return;

    this.pending.delete(correlationId);
    clearTimeout(pending.timeout);

    let result: unknown;
    try {
      result = JSON.parse(msg.content.toString('utf8'));
    } catch (err) {
      pending.reject(new Error(`RPC: failed to parse reply: ${(err as Error).message}`));
      return;
    }

    // Treat { error: string } as a server-side error
    if (typeof result === 'object' && result !== null && 'error' in result) {
      pending.reject(new Error((result as { error: string }).error));
    } else {
      pending.resolve(result);
    }

    this.logger.debug('RPC reply received', { correlationId });
  }

  async close(): Promise<void> {
    // Cancel all pending RPCs
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('RPC client closed'));
      this.pending.delete(id);
    }
    await this.channelManager.closeChannel(`rpc:${this.requestExchange}`);
    this.ch = null;
  }
}