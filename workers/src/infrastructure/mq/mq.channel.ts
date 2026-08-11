import { Injectable } from '@nestjs/common';
import amqp, { Options, Replies } from 'amqplib';
import {
    RabbitMQBindingException,
    RabbitMQExchangeAssertException,
    RabbitMQQueueAssertException,
} from './exceptions/mq.exceptions';
import {
    RTAssertQueueOptions,
    RTAssertQueueOptionsForMain,
} from './types/mq.types';

@Injectable()
export class Channel {
    constructor(private readonly channel: amqp.ConfirmChannel) {}

    async assertExchange(
        exchange: string,
        type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
        options?: Options.AssertExchange,
    ): Promise<Replies.AssertExchange> {
        try {
            const assert = await this.channel.assertExchange(exchange, type, {
                durable: options?.durable ?? true,
                autoDelete: options?.autoDelete ?? false,
                internal: options?.internal ?? false,
                alternateExchange: options?.alternateExchange,
            });

            // this.logger.debug('Exchange asserted', { name: cfg.name, type: cfg.type });
            return assert;
        } catch (error) {
            throw new RabbitMQExchangeAssertException(exchange, error as Error);
        }
    }

    async assertQueue(
        queue: string,
        cfg: Options.AssertQueue &
            Partial<{ maxLengthBytes: string; lazy: boolean }> = {},
    ): Promise<Replies.AssertQueue> {
        try {
            const args: Record<string, unknown> = {};

            if (cfg.messageTtl !== undefined)
                args['x-message-ttl'] = cfg.messageTtl;
            if (cfg.maxLength !== undefined)
                args['x-max-length'] = cfg.maxLength;
            if (cfg.maxLengthBytes !== undefined)
                args['x-max-length-bytes'] = cfg.maxLengthBytes;
            if (cfg.overflow !== undefined) args['x-overflow'] = cfg.overflow;
            if (cfg.deadLetterExchange !== undefined)
                args['x-dead-letter-exchange'] = cfg.deadLetterExchange;
            if (cfg.deadLetterRoutingKey !== undefined)
                args['x-dead-letter-routing-key'] = cfg.deadLetterRoutingKey;
            if (cfg.maxPriority !== undefined)
                args['x-max-priority'] = cfg.maxPriority;
            if (cfg.expires !== undefined) args['x-expires'] = cfg.expires;
            if (cfg.lazy === true) args['x-queue-mode'] = 'lazy';

            const reply = await this.channel.assertQueue(queue, {
                durable: cfg.durable ?? true,
                exclusive: cfg.exclusive ?? false,
                autoDelete: cfg.autoDelete ?? false,
                arguments: args,
            });

            // this.logger.debug('Queue asserted', { name: cfg.name });
            return reply;
        } catch (error) {
            throw new RabbitMQQueueAssertException(queue, error as Error);
        }
    }

    async bindQueue(
        queue: string,
        exchange: string,
        bindingKey: string,
        args?: any,
    ): Promise<void> {
        try {
            await this.channel.bindQueue(queue, exchange, bindingKey, args);
        } catch (error) {
            throw new RabbitMQBindingException(
                queue,
                exchange,
                bindingKey,
                error as Error,
            );
        }
    }

    async setupDeadLetterTopology(
        dlxExchange: string,
        dlxAssertExchangeOptions: Options.AssertExchange,
        dlxQueue: string,
        dlxQueueOptions: Options.AssertQueue &
            Partial<{ maxLengthBytes: string; lazy: boolean }>,
        dlxBindingKey: string,
        dlxBindQueueArg: {},
        mainExchange: string,
        mainAssertExchangeOptions: Options.AssertExchange,
        mainQueue: string,
        mainQueueOptions: RTAssertQueueOptionsForMain,
    ): Promise<void> {
        await this.assertExchange(
            dlxExchange,
            'direct',
            dlxAssertExchangeOptions,
        );

        await this.assertQueue(dlxQueue, dlxQueueOptions);

        await this.bindQueue(
            dlxQueue,
            dlxExchange,
            dlxBindingKey,
            dlxBindQueueArg,
        );

        await this.assertExchange(
            mainExchange,
            'direct',
            mainAssertExchangeOptions,
        );

        await this.assertQueue(mainQueue, mainQueueOptions);

        console.log('DLQ topology ready', {
            mainQueue: mainQueue,
            dlqExchange: dlxExchange,
            dlqQueue: dlxQueue,
        });
    }

    async setupRetryTopology(
        queue: string,
        exchange: string,
        bindingKey: string,
        assertQueueOptions: RTAssertQueueOptions,
        bindQueueArg: {},
    ): Promise<void> {
        await this.assertExchange(exchange, 'direct');

        await this.assertQueue(queue, assertQueueOptions);

        await this.bindQueue(queue, exchange, bindingKey, bindQueueArg);

        console.debug('Retry topology ready', {
            retryExchange: assertQueueOptions.deadLetterExchange,
            retryQueue: queue,
            delayMs: assertQueueOptions.messageTtl,
        });
    }
}
