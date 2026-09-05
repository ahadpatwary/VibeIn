import amqp, { ConfirmChannel } from 'amqplib';
import { RabbitMqClient } from './mq.client.js';
import { RabbitMQChannelCreationException } from './exceptions/mq.exceptions.js';
import { channelOptions } from './types/mq.types.js';




export class ChannelRecoveryModule {
    private channels = new Map<string, amqp.ConfirmChannel>();

    constructor(private client: RabbitMqClient) {}

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
            // this.logger.error('Channel error', { name, error: err.message });
            this.channels.delete(channelName);
        });

        channel.on('close', () => {
            // this.logger.warn('Channel closed', { name });
            this.channels.delete(channelName);
        });

        channel.on('return', (msg) => {
            // this.logger.warn('Message returned', { name, message: msg });
        });

        channel.on('drain', () => {
            // this.logger.info('Channel drain', { name });
        });

    }
}
