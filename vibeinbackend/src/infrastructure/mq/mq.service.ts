import * as amqp from 'amqplib';
import { EventEmitter } from 'events';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {type RabbitMQConfig } from './types/mq.types';
import { RabbitMqLogger } from './utils/mq.logger';

export interface ConnectionEvents {
  connected: () => void;
  disconnected: (err: Error) => void;
  reconnecting: (attempt: number) => void;
  failed: (err: Error) => void;
}

@Injectable()
export class RabbitMqService extends EventEmitter {
  private connection: amqp.ChannelModel | null = null;
  // private channel: amqp.Channel | null = null;

  private reconnectAttempts = 0;
  private reconnectingPromise: Promise<void> | null = null;

  constructor(
    @Inject('RABBITMQ_CONFIG') private readonly config: RabbitMQConfig,
    @Inject('RABBITMQ_LOGGER') private readonly logger: RabbitMqLogger,
  ) {
    super();
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

 
  private async connect(): Promise<void> {
    if (this.reconnectingPromise) {
      return this.reconnectingPromise;
    }

    this.reconnectingPromise = this._connect();
    await this.reconnectingPromise;
    this.reconnectingPromise = null;
  }

  private async _connect(): Promise<void> {
    try {
      this.logger.info('Connecting to RabbitMQ...');

      const conn = await amqp.connect(this.config.url, {
        heartbeat: this.config.heartbeat,
        clientProperties: {
          connection_name: this.config.connectionName,
        },
      });

      this.connection = conn;
      this.reconnectAttempts = 0;

      // await this.createChannel();


      conn.on('error', (err) => {
        this.logger.error(`Connection error: ${err.message}`);
        this.handleDisconnect(err);
      });

      conn.on('close', () => {
        this.logger.warn('Connection closed');
        this.handleDisconnect(new Error('Connection closed'));
      });

      this.emit('connected');
      this.logger.info('RabbitMQ connected ✔');

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Initial connect failed: ${error.message}`);

      await this.scheduleReconnect(error);
    }
  }

  // =========================
  // CHANNEL CREATION
  // =========================
  // private async createChannel() {
  //   if (!this.connection) return;

  //   this.channel = await this.connection.createChannel();

  //   this.channel.on('error', (err) => {
  //     this.logger.error(`Channel error: ${err.message}`);
  //   });

  //   this.channel.on('close', () => {
  //     this.logger.warn('Channel closed');
  //   });
  // }

  private handleDisconnect(err: Error) {
    this.connection = null;
    // this.channel = null;

    this.emit('disconnected', err);

    this.scheduleReconnect(err).catch(() => {});
  }

  // =========================
  // RECONNECT LOGIC
  // =========================
  private async scheduleReconnect(err: Error): Promise<void> {
    if (!this.config.reconnectDelay || !this.config.maxReconnectDelay || !this.config.maxReconnectAttempts) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached');
      this.emit('failed', err);
      return;
    }

    this.reconnectAttempts++;

    const base = this.config.reconnectDelay;
    const raw = base * Math.pow(2, this.reconnectAttempts - 1);

    const delay = Math.min(raw, this.config.maxReconnectDelay) *
      (0.5 + Math.random() * 0.5); // jitter

    this.emit('reconnecting', this.reconnectAttempts);

    this.logger.warn(
      `Reconnecting attempt ${this.reconnectAttempts} in ${Math.floor(delay)}ms`,
    );

    await new Promise((r) => setTimeout(r, delay));

    await this.connect();
  }

 
  // async getChannel(): Promise<amqp.Channel> {
  //   if (this.channel) return this.channel;

  //   await this.connect();

  //   if (!this.channel) {
  //     throw new Error('RabbitMQ channel not available');
  //   }

  //   return this.channel;
  // }


  private async close() {
    try {
      // await this.channel?.close();
      await this.connection?.close();

      // this.channel = null;
      this.connection = null;

      this.logger.info('RabbitMQ closed gracefully');
    } catch (err) {
      this.logger.error('Error during shutdown');
    }
  }
}