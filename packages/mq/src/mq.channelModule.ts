import amqp, { ConfirmChannel } from 'amqplib';
import { RabbitMQChannelCreationException } from './exceptions/mq.exceptions.js';
import { channelOptions } from './types/mq.types.js';
import { inject, injectable, singleton } from 'tsyringe';
import { RabbitMqConnection } from './mq.connection.js';
import { MQ_TOKENS } from './tokens/tokens.js';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';



@injectable()
@singleton()
export class ChannelRecoveryModule {
    private channels = new Map<string, amqp.ConfirmChannel>();
    private readonly logger: ILogger;

    constructor(
        @inject(MQ_TOKENS.RabbitMqConnection)
        private client: RabbitMqConnection,
        @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
    ) {
        this.logger = factory.forModule("RABBITMQ_MODULE")
    }

    async getChannel(options: channelOptions): Promise<ConfirmChannel> {
        
        if (this.channels.has(options.name)) {
            return this.channels.get(options.name)!;
        }
    
        const channel = await this.#createConfirmChannel(options);


        this.#registerEventHandlers(channel, options.name);

        this.channels.set(options.name, channel);

        return channel;
    }

    async closeChannel(name: string): Promise<void> {
        const channel = this.channels.get(name);

        try {
            await channel?.close();
        } catch (error) {
            await channel?.close();
        } finally {
            this.channels.delete(name);
        }
    }

    get channelCount(): number {
        return this.channels.size;
    }

    async #createConfirmChannel(
        options: channelOptions,
    ): Promise<ConfirmChannel> {
        try {
            const connection: amqp.RecoveringChannelModel = await this.client.getClient(); 
            const ch = await connection.createConfirmChannel();
            await ch.prefetch(options.prefetch ?? 1);
            return ch;
        } catch (error) {

            if(error instanceof RabbitMQChannelCreationException) {
                throw error;
            }

            throw new RabbitMQChannelCreationException(
                options.name,
                error as Error,
                {},
            );
        }
    }

    #registerEventHandlers(
        channel: amqp.ConfirmChannel,
        channelName: string,
    ): void {
        channel.on('error', (err: Error) => {
            this.logger.error('Channel error', { channelName, error: err.message });
            this.channels.delete(channelName);
        });

        channel.on('close', () => {
            this.logger.warn('Channel closed', { channelName });
            this.channels.delete(channelName);
        });

        channel.on('return', (msg) => {
            this.logger.warn('Message returned', { channelName, message: msg });
        });

        channel.on('drain', () => {
            this.logger.info('Channel drain', { channelName });
        });

    }
}
