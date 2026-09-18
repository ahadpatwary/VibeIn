
export const MQ_TOKENS = {
    Channel: Symbol.for("Channel"),
    MqConfig: Symbol.for("MqConfig"),
    QueueConfig: Symbol.for("QueueConfig"),
    Logger: Symbol.for("Logger"),
    RabbitMqConnection: Symbol.for('RabbitMqConnection'),
    ConnectionOptions: Symbol.for("ConnectionOptions"),
    QueueInit: Symbol.for("QueueInit"),
} as const;
