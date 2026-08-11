import { Injectable } from '@nestjs/common';
import amqp, { ChannelOptions, ConfirmChannel } from 'amqplib';
import { RabbitMqClient } from './mq.client';
import { RabbitMQChannelCreationException } from './exceptions/mq.exceptions';

type channelOptions = ChannelOptions & {
    name: string;
    prefetch: number;
};

@Injectable()
export class ChannelRecoveryModule {
    private channels = new Map<string, amqp.ConfirmChannel>();

    constructor(private readonly connection: amqp.RecoveringChannelModel) {}

    async getChannel(options: channelOptions): Promise<ConfirmChannel> {
        if (this.channels.has(options.name)) {
            return this.channels.get(options.name)!;
        }

        const channel = await this.createConfirmChannel(options);

        this.registerEventHandlers(channel, options.name);

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

    private async createConfirmChannel(
        options: channelOptions,
    ): Promise<ConfirmChannel> {
        try {
            const ch = await this.connection.createConfirmChannel();
            await ch.prefetch(options.prefetch ?? 1);
            return ch;
        } catch (error) {
            throw new RabbitMQChannelCreationException(
                'default',
                error as Error,
                {},
            );
        }
    }

    private registerEventHandlers(
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
    }
}
