import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { connect, Channel, ChannelModel } from 'amqplib';

export interface optionsType {
    uri: string, 
    retryAttempts?: number | undefined,
    retryDelay?: number | undefined,
}

export interface Publish{
    publish : (queue: string, message: Buffer<ArrayBufferLike>) => Promise<void>
} 


@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy, Publish {
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private tryCount = 0;
    private readonly logger = new Logger(RabbitMqService.name);

    constructor(
        @Inject('RABBITMQ_OPTIONS') private readonly options: optionsType,
    ) {}

    async onModuleInit() {
        await this.connectWithRetry();
    }

    private async connectWithRetry() {
        try {
            this.connection = await connect(this.options.uri);
            this.channel = await this.connection.createChannel();
            this.tryCount = 0;
            this.logger.log('RabbitMQ connected successfully');

            this.connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed, retrying...');
                setTimeout(() => this.connectWithRetry(), this.options.retryDelay ?? 60000);
            });

            this.connection.on('error', (err) => {
                this.logger.error('RabbitMQ connection error', err.stack);
            });

        } catch (err) {

            this.tryCount++;
            this.logger.error(`RabbitMQ connection failed (attempt ${this.tryCount})`, err.stack);

            if (this.tryCount <= (this.options?.retryAttempts ?? 3)) {
                this.logger.log(`Retrying in ${this.options.retryDelay ?? 60000} ms...`);
                setTimeout(() => this.connectWithRetry(), this.options.retryDelay ?? 60000);
            } else {
                this.logger.error('Max retry attempts reached. Could not connect to RabbitMQ.');
            }

        }
    }

    async publish(queue: string, message: Buffer) {
        if (!this.channel) throw new Error('RabbitMQ channel not initialized');
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, message);
    }

    async onModuleDestroy() {
        try {

            if (this.channel) await this.channel.close();
            if (this.connection) await this.connection.close();
            this.logger.log('RabbitMQ disconnected');

        } catch (err) {
            this.logger.error('Error during RabbitMQ disconnect', err.stack);
        }
    }
}
