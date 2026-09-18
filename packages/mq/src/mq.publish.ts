import amqp, { ConfirmChannel, Options } from 'amqplib';
import { MessageSerializer } from './utils/mq.serializer.js';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQPublishException } from './exceptions/mq.exceptions.js';
import { inject, injectable } from 'tsyringe';
import { ILogger, LoggerFactory } from '@app/logger';
import { MQ_TOKENS } from './tokens/tokens.js';



@injectable()
export class PublishService {
    private readonly logger: ILogger;

    constructor(@inject(MQ_TOKENS.Logger) factory: LoggerFactory) {
        this.logger = factory.forModule("RABBITMQ_MODULE");
    }

    async publish<T>(
        data: T,
        ch: ConfirmChannel,
        routingKey: string,
        exchangeName: string,
        opts: Options.Publish,
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

        try {
            await this.#publishWithConfirm(
                ch,
                exchangeName,
                routingKey, 
                buffer,
                amqpOpts,
            );
        } catch (error) {
            this.logger.error(`message can't be published`, error, {
                exchangeName,
                routingKey,
                messageId: amqpOpts.messageId,
            }) 
        }
  
    }

    async #publishWithConfirm(
        ch: amqp.ConfirmChannel,
        exchange: string,
        routingKey: string,
        content: Buffer,
        opts: Options.Publish,
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
                this.logger.warn('Write buffer full');

                ch.once('drain', () => {
                    this.logger.debug('Drain emitted');
                });
            }
        });
    }
}