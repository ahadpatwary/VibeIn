import amqp, { ConfirmChannel, Options } from 'amqplib';
import { PublishOptions } from './types/mq.types.js';
import { MessageSerializer } from './utils/mq.serializer.js';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQPublishException } from './exceptions/mq.exceptions.js';


export class PublishService {
    constructor() {}

    async publish<T>(
        data: T,
        ch: ConfirmChannel,
        routingKey: string,
        exchangeName: string,
        opts: PublishOptions,
    ): Promise<void> {
        const buffer = MessageSerializer.serialize(data);

        const amqpOpts: amqp.Options.Publish = {
            persistent: true,
            messageId: uuidv4(),
            mandatory: true,
            correlationId: uuidv4(),
            contentEncoding: 'utf-8',
            appId: 'vibeIn',
            

            ...opts,
        };

        await this.publishWithConfirm(
            ch,
            exchangeName,
            routingKey, 
            buffer,
            amqpOpts,
        );

        // this.logger.debug('Message published', {
        //     exchange:   this.exchange.name,
        //     routingKey,
        //     messageId:  envelope.id,
        // });

        // return envelope;
    }

    private async publishWithConfirm(
        ch: amqp.ConfirmChannel,
        exchange: string,
        routingKey: string,
        content: Buffer,
        opts: amqp.Options.Publish,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const ok = ch.publish(
                exchange,
                routingKey,
                content,
                opts,
                (err) => {
                    return err
                        ? reject(
                            new RabbitMQPublishException(
                                exchange,
                                routingKey,
                                err as Error,
                            ),
                        )
                        : resolve()
                    ;
                },
            );

            if (!ok) {
                // this.logger.warn('Write buffer full');

                ch.once('drain', () => {
                    // this.logger.debug('Drain emitted');
                });
            }
        });
    }
}
