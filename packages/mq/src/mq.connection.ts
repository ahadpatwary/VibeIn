import amqp from 'amqplib';
import {
    ConnectionOptions,
    RabbitmqConfig,
} from './types/mq.types.js';
import { RabbitMQConnectionException } from './exceptions/mq.exceptions.js';
import { RABBITMQ_CONNECTION_EVENT } from './constants/mq.constants.js';
import { inject, injectable } from 'tsyringe';
import { MQ_TOKENS } from './tokens/tokens.js';
import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';

@injectable()
export class RabbitMqConnection {
    private connection: amqp.RecoveringChannelModel | null = null;
    private isQueueConnected: boolean = false;
    private readonly logger: ILogger;

    constructor(
        @inject(MQ_TOKENS.MqConfig)
        private readonly config: RabbitmqConfig,
        @inject(MQ_TOKENS.ConnectionOptions) 
        private readonly rabbitMqConnectionOptions: ConnectionOptions,
        @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
    ) {
        this.logger = factory.forModule('MQ_MODULE');
    }

    async getClient(): Promise<amqp.RecoveringChannelModel> {
        if (this.connection && this.isQueueConnected) return this.connection;

        try {

            this.connection = await  amqp.connect(this.config, this.rabbitMqConnectionOptions);
            this.isQueueConnected = true; 

            this.registerEventHandlers(this.connection);

            this.logger.info('Rabbitmq connected successfully', {
                host: this.config.hostname,
                port: this.config.port,
            });

            return this.connection;
        } catch (error) {
            throw new RabbitMQConnectionException(error as Error, {
                host: this.config.hostname,
                port: this.config.port,
            });
        } finally {
            // this.isConnecting = false;
        }
    }

    async disconnect(): Promise<void> {
    
        if(this.connection === null || !this.isQueueConnected) return;

        try {
            this.connection.close();
        } catch (error) {
            this.connection.close();
        } finally {
            this.connection = null;
            this.isQueueConnected = false;
        }
    }

    private registerEventHandlers(connection: amqp.RecoveringChannelModel): void {
        connection.on(RABBITMQ_CONNECTION_EVENT.CONNECT, () => {
            this.logger.info('RabbitMq connection established');
            this.isQueueConnected = true;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.DISCONNECT, () => {
            this.logger.info('RabbitMq connection disconnect');
            this.isQueueConnected = false;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.CONNECTION_FAILED, () => {
            this.logger.error('RabbitMq connection failed');
            this.isQueueConnected = false;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_SCHEDULED, () => {
            this.logger.warn('RabbitMq reconnected scheduled');
            this.isQueueConnected = false;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_FAILED, () => {
            this.logger.info('RabbitMq reconnecting failed');
            this.isQueueConnected = false;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.BLOCKED, () => {
            this.logger.warn('RabbitMq connection blocked');
            this.isQueueConnected = false;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.UNBLOCKED, () => {
            this.logger.info('RabbitMq connection unblocked');
            this.isQueueConnected = true;
        });

        connection.on(RABBITMQ_CONNECTION_EVENT.UPDATE_SECRET_OK, () => {
            this.logger.info('Rabbitmq connection update secret ok');
            this.isQueueConnected = true;
        });
    }
}
