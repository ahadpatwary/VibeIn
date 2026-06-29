import * as amqp from 'amqplib';
import { ExchangeConfig, QueueConfig, DLQConfig } from '../types/mq.types';
import { RabbitMqLogger, Logger } from '../utils/mq.logger';



export class ChannelManager {
  private channels = new Map<string, amqp.ConfirmChannel>();
  private readonly logger: Logger;

  constructor(private readonly connManager: any) {
    this.logger = new RabbitMqLogger();

    // Tear down channel cache on reconnect so fresh channels are created
    this.connManager.on('connected', () => {
      this.channels.clear();
      this.logger.info('Channel cache cleared after reconnect');
    });
  }

  // ─── Channel acquisition ──────────────────────────────────

  // push the message to every single queue has unique channel. so if we have 10 queues, we will have 10 channels. and each channel will be closed if there is an error or close event on that channel. and when we publish a message, we will get the channel for that queue from the channel array and publish the message to that channel. and if the channel is closed, we will create a new channel for that queue. So we never create channel every time.
  async getChannel(name = 'default'): Promise<amqp.ConfirmChannel> {
    if (this.channels.has(name)) {
      return this.channels.get(name)!;
    }

    const conn = await this.connManager.getConnection();
    const ch   = await conn.createConfirmChannel();

    // const prefetch = this.connManager.getConfig().prefetch;
    // await ch.prefetch(prefetch);

    ch.on('error', (err: Error) => {
      this.logger.error('Channel error', { name, error: err.message });
      this.channels.delete(name);
    });

    ch.on('close', () => {
      this.logger.warn('Channel closed', { name });
      this.channels.delete(name);
    });

    this.channels.set(name, ch);
    // this.logger.debug('Channel created', { name, prefetch });
    this.logger.debug('Channel created', { name });
    return ch;
  }

  async closeChannel(name = 'default'): Promise<void> {
    const ch = this.channels.get(name);
    if (ch) {
      try { 
        await ch.close(); 
      } catch {
        //If error exist then don't try again to close the channel and just remove it from the cache(channels array)
        this.channels.delete(name)
      }
    }
  }

  get channelCount(): number { return this.channels.size; }


  async assertExchange(
    ch: amqp.Channel,
    cfg: ExchangeConfig,
  ): Promise<void> {
    await ch.assertExchange(cfg.name, cfg.type, {
      durable:          cfg.durable          ?? true,
      autoDelete:       cfg.autoDelete       ?? false,
      internal:         cfg.internal         ?? false,
      alternateExchange: cfg.alternateExchange,
    });
    this.logger.debug('Exchange asserted', { name: cfg.name, type: cfg.type });
  }


  async assertQueue(
    ch: amqp.Channel,
    cfg: QueueConfig,
  ): Promise<amqp.Replies.AssertQueue> {
    const args: Record<string, unknown> = {};

    if (cfg.messageTtl       !== undefined) args['x-message-ttl']          = cfg.messageTtl;
    if (cfg.maxLength         !== undefined) args['x-max-length']            = cfg.maxLength;
    if (cfg.maxLengthBytes    !== undefined) args['x-max-length-bytes']      = cfg.maxLengthBytes;
    if (cfg.overflow          !== undefined) args['x-overflow']              = cfg.overflow;
    if (cfg.deadLetterExchange !== undefined) args['x-dead-letter-exchange'] = cfg.deadLetterExchange;
    if (cfg.deadLetterRoutingKey !== undefined) args['x-dead-letter-routing-key'] = cfg.deadLetterRoutingKey;
    if (cfg.lazy              === true)      args['x-queue-mode']            = 'lazy';

    const reply = await ch.assertQueue(cfg.name, {
      durable:    cfg.durable    ?? true,
      exclusive:  cfg.exclusive  ?? false,
      autoDelete: cfg.autoDelete ?? false,
      arguments:  args,
    });

    this.logger.debug('Queue asserted', { name: cfg.name });
    return reply;
  }

  
  async setupDeadLetterTopology(
    ch: amqp.Channel,
    mainExchange: ExchangeConfig,
    mainQueue: QueueConfig,
    dlqCfg: Required<DLQConfig>,
  ): Promise<void> {
    // 1. DLQ exchange
    await this.assertExchange(ch, {
      name: dlqCfg.exchangeName,
      type: 'direct',
      durable: true,
    });

    // 2. DLQ queue
    const dlqQueueArgs: Record<string, unknown> = {};
    if (dlqCfg.messageTtl) dlqQueueArgs['x-message-ttl'] = dlqCfg.messageTtl;

    await ch.assertQueue(dlqCfg.queueName, {
      durable: true,
      arguments: dlqQueueArgs,
    });

    // 3. Bind DLQ queue → DLQ exchange
    await ch.bindQueue(dlqCfg.queueName, dlqCfg.exchangeName, dlqCfg.routingKey);

    // 4. Main exchange
    await this.assertExchange(ch, mainExchange);

    // 5. Main queue — wired to DLQ exchange on nack/expiry/overflow
    const mainQueueWithDLQ: QueueConfig = {
      ...mainQueue,
      deadLetterExchange:   dlqCfg.exchangeName,
      deadLetterRoutingKey: dlqCfg.routingKey,
    };
    await this.assertQueue(ch, mainQueueWithDLQ);

    this.logger.info('DLQ topology ready', {
      mainQueue:   mainQueue.name,
      dlqExchange: dlqCfg.exchangeName,
      dlqQueue:    dlqCfg.queueName,
    });
  }

  //____________________________________RETRY_QUEUE_______________________

  async setupRetryTopology(
    ch: amqp.Channel,
    mainExchange: ExchangeConfig,
    routingKey: string,
    retryExchangeName: string,
    retryQueueName: string,
    delayMs: number,
  ): Promise<void> {
    // Retry exchange (direct)
    await this.assertExchange(ch, {
      name:    retryExchangeName,
      type:    'direct',
      durable: true,
    });

    // Retry queue: messages sit here for `delayMs`, then dead-letter back
    await ch.assertQueue(retryQueueName, {
      durable: true,
      arguments: {
        'x-message-ttl':          delayMs,
        'x-dead-letter-exchange':  mainExchange.name,
        'x-dead-letter-routing-key': routingKey,
      },
    });

    await ch.bindQueue(retryQueueName, retryExchangeName, routingKey);

    this.logger.debug('Retry topology ready', {
      retryExchange: retryExchangeName,
      retryQueue:    retryQueueName,
      delayMs,
    });
  }

}