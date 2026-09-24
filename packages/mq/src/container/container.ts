import { container, DependencyContainer } from 'tsyringe';
import { ConnectionOptions, RabbitmqConfig } from '../types/mq.types';
import { MQ_TOKENS } from '../tokens/tokens';
import { RabbitMqConnection } from '../mq.connection';
import { LoggerFactory, registerLogger } from '@app/logger';
import { QueueInit } from '../mq.queueInit';
import { ChannelRecoveryModule } from '../mq.channelModule';
import { ProcessType, QueueConfigItem } from '../configuration';

export function registerMq(
   targetContainer: DependencyContainer = container,
   queueConfig: QueueConfigItem<ProcessType>,
   config?: RabbitmqConfig,
   connectionOptions?: ConnectionOptions,
) {
   const cfg = config!; //TODO: here we use the actual config function.
   const cfgOptions = connectionOptions!; //TODO: we have to change here.

   targetContainer.registerInstance<RabbitmqConfig>(MQ_TOKENS.MqConfig, cfg);
   targetContainer.registerInstance(MQ_TOKENS.ConnectionOptions, cfgOptions);

   targetContainer.registerInstance(MQ_TOKENS.QueueConfig, queueConfig);

   targetContainer.registerSingleton(MQ_TOKENS.Channel, ChannelRecoveryModule);

   targetContainer.registerInstance(MQ_TOKENS.QueueInit, QueueInit);

   targetContainer.registerInstance(MQ_TOKENS.RabbitMqConnection, RabbitMqConnection);
}
