import amqp, { RecoveryOptions, SocketOptions } from 'amqplib';

import {
    RabbitMqConnectionOptions,
    type RabbitMQConfig,
} from './types/mq.types.js';

import { RabbitMQConnectionException } from './exceptions/mq.exceptions.js';
import { RABBITMQ_CONNECTION_EVENT } from './constants/mq.constants.js';
import { createRabbitMQConfig } from './config/mq.config.js';


export class RabbitMqClient {
    private client: amqp.RecoveringChannelModel | null = null;
    private isQueueConnected: boolean = false;

    constructor(
        // @Inject('RABBITMQ_OPTIONS')
        private config: RabbitMQConfig, // module e ja pathano hobe
        // private readonly logger: ILogger,
    ) {}

    async getClient(): Promise<amqp.RecoveringChannelModel> {
        if (this.client && this.isQueueConnected) return this.client;

        // if (this.isConnecting)
        //     throw new RabbitMQConnectionException(
        //         new Error('Connection attempt already in processing'),
        //     );

        // this.isConnecting = true;

        const config = createRabbitMQConfig(this.config);

        const RabbitmqConfig: RabbitMqConnectionOptions = {
            protocol: config.protocol,
            hostname: config.hostname,
            port: config.port,
            username: config.username,
            password: config.password,
            heartbeat: config.heartbeat,
            channelMax: config.channelMax,
        };

        const options: SocketOptions & { recovery: RecoveryOptions | true}   = {
            noDelay: config.noDelay,
            timeout: config.timeout,
            keepAlive: config.keepAlive,
            keepAliveDelay: config.keepAliveDelay,
            recovery: {
                factor: config.factor,
                initialDelay: config.initialDelay,
                jitter: config.jitter,
                maxDelay: config.maxDelay,
                maxRetries: config.maxRetries,
            },

        };

        try {

            this.client = await amqp.connect(RabbitmqConfig, options);
            this.isQueueConnected = true; 

            this.registerEventHandlers(this.client);

            // this.logger.info('Rabbitmq connected successfully', {
            //     host: this.config.hostname,
            //     port: this.config.port,
            // });

            return this.client;
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
    
        if(this.client === null || !this.isQueueConnected) return;

        try {
            this.client.close();
        } catch (error) {
            this.client.close();
        } finally {
            this.client = null;
            this.isQueueConnected = false;
        }
    }

    private registerEventHandlers(client: amqp.RecoveringChannelModel): void {
        client.on(RABBITMQ_CONNECTION_EVENT.CONNECT, () => {
            // this.logger.info('RabbitMq client established');
            this.isQueueConnected = true;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.DISCONNECT, () => {
            // this.logger.info('RabbitMq client disconnect');
            this.isQueueConnected = false;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.CONNECTION_FAILED, () => {
            // this.logger.error('RabbitMq client failed');
            this.isQueueConnected = false;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_SCHEDULED, () => {
            // this.logger.warn('RabbitMq reconnected scheduled');
            this.isQueueConnected = false;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_FAILED, () => {
            // this.logger.info('RabbitMq reconnecting failed');
            this.isQueueConnected = false;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.BLOCKED, () => {
            // this.logger.warn('RabbitMq client blocked');
            this.isQueueConnected = false;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.UNBLOCKED, () => {
            // this.logger.info('RabbitMq client unblocked');
            this.isQueueConnected = true;
        });

        client.on(RABBITMQ_CONNECTION_EVENT.UPDATE_SECRET_OK, () => {
            // this.logger.info('Rabbitmq client update secret ok');
            this.isQueueConnected = true;
        });
    }
}
