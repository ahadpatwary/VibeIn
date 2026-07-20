import { Inject, Injectable } from "@nestjs/common";
import amqp, { ChannelOptions, ConfirmChannel } from 'amqplib'
import { RabbitMqConnectionOptions, RabbitMqRecoverAndSocketOptions, type RabbitMQConfig } from "./types/mq.types";
import { ILogger } from "../database/utils/database.logger";
import { RabbitMQChannelCreationException, RabbitMQConnectionException } from "./exceptions/mq.exceptions";
import { RABBITMQ_CONNECTION_EVENT } from "./constants/mq.constants";
import { createRabbitMQConfig } from "./config/mq.config";
import { errorMonitor } from "events";



@Injectable()
export class RabbitMqClient {
    private client: amqp.RecoveringChannelModel | null = null;
    private isConnecting: boolean = false;

    constructor (
        @Inject('RABBITMQ_OPTIONS')
        private config: RabbitMQConfig,    // module e ja pathano hobe
        private readonly logger: ILogger
    ) {}

    async connect(): Promise<amqp.RecoveringChannelModel> {

        if (this.client) return this.client;

        if(this.isConnecting) throw new RabbitMQConnectionException(
            new Error('Connection attempt already in processing')
        )

        this.isConnecting = true;
        
        const config = createRabbitMQConfig(this.config);


        const RabbitmqConfig: RabbitMqConnectionOptions = {
            protocol: config.protocol,
            hostname: config.hostname,
            port: config.port,
            username: config.username,
            password: config.password,
            heartbeat: config.heartbeat, 
            channelMax: config.channelMax,
        }

        const options: RabbitMqRecoverAndSocketOptions= {
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
            }
        };

        try {

            
            this.client = await amqp.connect(RabbitmqConfig, options);


            this.registerEventHandlers(this.client);

            this.logger.info('Rabbitmq connected successfully', {
                host: this.config.hostname,
                port: this.config.port,
            });

            return this.client;

        } catch (error) {
            throw new RabbitMQConnectionException(error as Error, {
                host: this.config.hostname,
                port: this.config.port,
            })
        } finally {
            this.isConnecting = false;
        }

    }

    async disconnect(): Promise<void> {
        if(!this.client) return;

        try {
            this.client.close();
        } catch (error) {
            this.client.close();
        } finally {
            this.client = null;
        }
    }

    get getClient(): amqp.RecoveringChannelModel {

        if(!this.client) {
            throw new RabbitMQConnectionException(
                new Error('Rabbitmq client missing')
            )
        }

        this.connected();

        return this.client;
    }

    private connected(): void {
        throw new RabbitMQConnectionException(
            new Error('Rabbitmq connection is not ready to create channel')
        )
    }
 

    private registerEventHandlers(client: amqp.RecoveringChannelModel ): void {
        client.on(RABBITMQ_CONNECTION_EVENT.CONNECT, () => {
            this.logger.info('RabbitMq client established');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.DISCONNECT, () => {
            this.logger.info('RabbitMq client disconnect');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.CONNECTION_FAILED, () => {
            this.logger.error('RabbitMq client failed');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_SCHEDULED, () => {
            this.logger.warn('RabbitMq reconnected scheduled');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.RECONNECT_FAILED, () => {
            this.logger.info('RabbitMq reconnecting failed');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.BLOCKED, () => {
            this.logger.warn('RabbitMq client blocked');
        });

        client.on(RABBITMQ_CONNECTION_EVENT.UNBLOCKED, () => {
            this.logger.info('RabbitMq client unblocked');
        })

        client.on(RABBITMQ_CONNECTION_EVENT.UPDATE_SECRET_OK, () => {
            this.logger.info('Rabbitmq client update secret ok');
        })
    }
}