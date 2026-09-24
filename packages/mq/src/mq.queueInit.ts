import { Options, Replies } from 'amqplib';
import {
   RabbitMQBindingException,
   RabbitMQChannelCreationException,
   RabbitMQExchangeAssertException,
   RabbitMQQueueAssertException,
} from './exceptions/mq.exceptions.js';
import {
   channelOptions,
   RTAssertQueueOptions,
   RTAssertQueueOptionsForMain,
} from './types/mq.types.js';
import { inject, injectable } from 'tsyringe';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';
import { MQ_TOKENS } from './tokens/tokens.js';
import { ChannelRecoveryModule } from './mq.channelModule.js';

@injectable()
export class QueueInit {
   private readonly logger: ILogger;

   constructor(
      @inject(MQ_TOKENS.Channel)
      private readonly channel: ChannelRecoveryModule,
      @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
   ) {
      this.logger = factory.forModule('RABBITMQ_MODULE');
   }

   async assertExchange(
      channelOpt: channelOptions,
      exchange: string,
      type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
      options: Options.AssertExchange = {},
   ): Promise<Replies.AssertExchange> {
      try {
         const channel = await this.channel.getChannel(channelOpt);

         const assert = await channel.assertExchange(exchange, type, {
            durable: true,
            autoDelete: false,
            internal: false,
            ...options,
         });

         // this.logger.debug('Exchange asserted', { name: cfg.name, type: cfg.type });
         return assert;
      } catch (error) {
         if (error instanceof RabbitMQChannelCreationException) throw error;

         throw new RabbitMQExchangeAssertException(exchange, error as Error);
      }
   }

   async assertQueue(
      channelOpt: channelOptions,
      queue: string,
      cfg: Options.AssertQueue & Partial<{ maxLengthBytes: string; lazy: boolean }> = {},
   ): Promise<Replies.AssertQueue> {
      try {
         const args: Record<string, unknown> = {};

         if (cfg.messageTtl !== undefined) args['x-message-ttl'] = cfg.messageTtl;
         if (cfg.maxLength !== undefined) args['x-max-length'] = cfg.maxLength;
         if (cfg.maxLengthBytes !== undefined) args['x-max-length-bytes'] = cfg.maxLengthBytes;
         if (cfg.overflow !== undefined) args['x-overflow'] = cfg.overflow;
         if (cfg.deadLetterExchange !== undefined)
            args['x-dead-letter-exchange'] = cfg.deadLetterExchange;
         if (cfg.deadLetterRoutingKey !== undefined)
            args['x-dead-letter-routing-key'] = cfg.deadLetterRoutingKey;
         if (cfg.maxPriority !== undefined) args['x-max-priority'] = cfg.maxPriority;
         if (cfg.expires !== undefined) args['x-expires'] = cfg.expires;
         if (cfg.lazy === true) args['x-queue-mode'] = 'lazy';

         const channel = await this.channel.getChannel(channelOpt);

         const reply = await channel.assertQueue(queue, {
            durable: cfg.durable ?? true,
            exclusive: cfg.exclusive ?? false,
            autoDelete: cfg.autoDelete ?? false,
            arguments: args,
         });

         this.logger.debug('Queue asserted', { name: queue });
         return reply;
      } catch (error) {
         if (error instanceof RabbitMQChannelCreationException) throw error;
         throw new RabbitMQQueueAssertException(queue, error as Error);
      }
   }

   async customBindQueue(
      channelOpt: channelOptions,
      queue: string,
      exchange: string,
      bindingKey: string,
      args?: any,
   ): Promise<void> {
      try {
         const channel = await this.channel.getChannel(channelOpt);
         await channel.bindQueue(queue, exchange, bindingKey, args);
      } catch (error) {
         if (error instanceof RabbitMQChannelCreationException) throw error;

         throw new RabbitMQBindingException(queue, exchange, bindingKey, error as Error);
      }
   }

   // async setupDeadLetterTopology(
   //     dlxExchange: string,
   //     dlxAssertExchangeOptions: Options.AssertExchange,
   //     dlxQueue: string,
   //     dlxQueueOptions: Options.AssertQueue &
   //         Partial<{ maxLengthBytes: string; lazy: boolean }>,
   //     dlxBindingKey: string,
   //     dlxBindQueueArg: {},
   //     mainExchange: string,
   //     mainAssertExchangeOptions: Options.AssertExchange,
   //     mainQueue: string,
   //     mainQueueOptions: RTAssertQueueOptionsForMain,
   // ): Promise<void> {
   //     await this.assertExchange(
   //         dlxExchange,
   //         'direct',
   //         dlxAssertExchangeOptions,
   //     );

   //     await this.assertQueue(dlxQueue, dlxQueueOptions);

   //     await this.customBindQueue(
   //         dlxQueue,
   //         dlxExchange,
   //         dlxBindingKey,
   //         dlxBindQueueArg,
   //     );

   //     await this.assertExchange(
   //         mainExchange,
   //         'direct',
   //         mainAssertExchangeOptions,
   //     );

   //     await this.assertQueue(mainQueue, mainQueueOptions);

   //     console.log('DLQ topology ready', {
   //         mainQueue: mainQueue,
   //         dlqExchange: dlxExchange,
   //         dlqQueue: dlxQueue,
   //     });
   // }

   // async setupRetryTopology(
   //     queue: string,
   //     exchange: string,
   //     bindingKey: string,
   //     assertQueueOptions: RTAssertQueueOptions,
   //     bindQueueArg: {},
   // ): Promise<void> {
   //     await this.assertExchange(exchange, 'direct');

   //     await this.assertQueue(queue, assertQueueOptions);

   //     await this.customBindQueue(queue, exchange, bindingKey, bindQueueArg);

   //     console.debug('Retry topology ready', {
   //         retryExchange: assertQueueOptions.deadLetterExchange,
   //         retryQueue: queue,
   //         delayMs: assertQueueOptions.messageTtl,
   //     });
   // }
}
