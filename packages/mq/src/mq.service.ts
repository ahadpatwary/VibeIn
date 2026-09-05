import amqp from 'amqplib';
import {
    Inject,
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ILogger } from '../database/utils/database.logger';
import { RabbitMqClient } from './mq.client.js';

export interface ConnectionEvents {
    connected: () => void;
    disconnected: (err: Error) => void;
    reconnecting: (attempt: number) => void;
    failed: (err: Error) => void;
}

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
    constructor(
        private client: RabbitMqClient,
        private readonly logger: ILogger,
    ) {}

    async onModuleInit() {
        this.client.connect();
    }

    async onModuleDestroy() {
        this.client.disconnect();
    }

    get module(): amqp.RecoveringChannelModel {
        return this.client.getClient;
    }
}
