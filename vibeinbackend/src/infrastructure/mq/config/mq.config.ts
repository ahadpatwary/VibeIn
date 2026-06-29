import { RabbitMQ_CONSTANTS } from "../constants/mq.constants";
import { RabbitMQConfig } from "../types/mq.types";



export class RabbitMQConfigBuilder {

    private config: Partial<RabbitMQConfig> = {};

    setUrl(url: string): this { this.config.url = url; return this; }

    setConnectionName(name: string): this { this.config.connectionName = name; return this; }

    setMaxReconnectAttempts(attempts: number): this { this.config.maxReconnectAttempts = attempts; return this; }

    setReconnectDelay(delay: number): this { this.config.reconnectDelay = delay; return this; }

    setMaxReconnectDelay(delay: number): this { this.config.maxReconnectDelay = delay; return this; }

    setHeartbeat(interval: number): this { this.config.heartbeat = interval; return this; }

    setPrefetch(count: number): this { this.config.prefetch = count; return this; }

    setPublisherConfirmTimeout(timeout: number): this { this.config.publisherConfirmTimeout = timeout; return this; }

    build(): RabbitMQConfig {
        if (!this.config.url) {
            throw new Error("RabbitMQ connection URL is required");
        }

        return {
            url: this.config.url,
            connectionName: this.config.connectionName ?? 'vibein-backend',
            maxReconnectAttempts: this.config.maxReconnectAttempts ?? Infinity,
            reconnectDelay: this.config.reconnectDelay ?? 1000,
            maxReconnectDelay: this.config.maxReconnectDelay ?? 30_000,
            heartbeat: this.config.heartbeat ?? 60,
            prefetch: this.config.prefetch ?? 10,
            publisherConfirmTimeout: this.config.publisherConfirmTimeout ?? 5000,

            ...this.config, // Override defaults with any explicitly set values
        };
    }
}

export function createRabbitMQConfig(env?: NodeJS.ProcessEnv): RabbitMQConfig {
    const e = env ?? process.env;
    const builder = new RabbitMQConfigBuilder()
        .setUrl(e.RABBITMQ_URL ?? 'amqp://localhost')
        .setConnectionName(e.RABBITMQ_CONNECTION_NAME ?? 'vibein-backend')
        .setMaxReconnectAttempts( parseInt(e.RABBITMQ_MAX_RECONNECT_ATTEMPTS ?? String(RabbitMQ_CONSTANTS.maxReconnectAttempts), 10)  )
        .setReconnectDelay( parseInt(e.RABBITMQ_RECONNECT_DELAY ?? String(RabbitMQ_CONSTANTS.reconnectDelay), 10)  )
        .setMaxReconnectDelay( parseInt(e.RABBITMQ_MAX_RECONNECT_DELAY ?? String(RabbitMQ_CONSTANTS.maxReconnectDelay), 10)  )
        .setHeartbeat( parseInt(e.RABBITMQ_HEARTBEAT ?? String(RabbitMQ_CONSTANTS.heartbeat), 10)  )
        .setPrefetch( parseInt(e.RABBITMQ_PREFETCH ?? String(RabbitMQ_CONSTANTS.prefetch), 10)  )
        .setPublisherConfirmTimeout( parseInt(e.RABBITMQ_PUBLISHER_CONFIRM_TIMEOUT ?? String(RabbitMQ_CONSTANTS.publisherConfirmTimeout), 10)  )
    ;   
    return builder.build();
}