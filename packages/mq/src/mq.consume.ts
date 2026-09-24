import amqp from 'amqplib';
import { RabbitMQConsumerStartException } from './exceptions/mq.exceptions.js';
import { channelOptions, consumerSideMessageHearders } from './types/mq.types.js';
import { ChannelRecoveryModule } from './mq.channelModule.js';
import { ILogger, LoggerFactory } from '@app/logger';

export abstract class BaseConsumer {
   protected config!: any;
   protected queueName!: string;
   protected channelOptions!: channelOptions;
   private channel!: amqp.Channel;
   private readonly logger: ILogger;

   constructor(
      protected readonly channelModel: ChannelRecoveryModule,
      factory: LoggerFactory,
      // protected readonly serviceId: string,
   ) {
      this.logger = factory.forModule('MQ_MODULE');
   }

   public async start(
      queueName: string,
      channelOptions: channelOptions,
      consumerOptions: amqp.Options.Consume,
   ): Promise<void> {
      this.channelOptions = channelOptions;
      this.queueName = queueName;

      this.channel = await this.channelModel.getChannel(channelOptions);

      const option: amqp.Options.Consume = {
         exclusive: false,
         noAck: false,
         ...consumerOptions,
      };

      try {
         await this.channel.consume(this.queueName, this.#consumerEngine, option);
      } catch (error) {
         throw new RabbitMQConsumerStartException(this.config.queueName, error as Error);
      }
   }

   public async stop(): Promise<void> {
      this.channelModel.closeChannel(this.queueName);
      this.logger.info(`Consumer stopped for queue: [${this.queueName}]`);
      this.channel = null as unknown as amqp.ConfirmChannel;
   }

   async #consumerEngine(msg: amqp.ConsumeMessage | null): Promise<void> {
      if (msg === null) return;

      const headers = msg.properties.headers as consumerSideMessageHearders;
      const lastProcessTime = headers['x-last-process-time'];

      /**
       * message processing time exceeded the limit, then we will reject the message and send it to DLQ or drop it.
       */
      if (lastProcessTime && Date.now() - lastProcessTime > 0) {
         this.logger.error(`Message processing time exceeded for ID: ${this.config.id}`);
         /**
          * last message processing time close.
          * Reject the message and don't requeue it.
          */
         this.channel.nack(msg, false, false);
         return;
      }

      try {
         const result = await this.processMessage(msg.content.toString());

         this.logger.info(`Message processed successfully for ID: ${this.config.id}`);

         /**
          * In this message process successfully and we have to send a response to another queue that queue name is (replyQueue) that I provided when I published the message to first queue.
          */
         if (msg.properties.replyTo) await this.sendAnotherQueue(msg, result);

         this.channel.ack(msg);
      } catch (error: any) {
         // If message processing failed or server cannot send the message to another queue,
         this.logger.error(`Error parsing message in [${this.config.id}]:`, error.message);

         await this.handleFailureFlow(msg, error);
      }
   }

   private async handleFailureFlow(msg: amqp.ConsumeMessage, error: Error): Promise<void> {
      const headers: consumerSideMessageHearders = msg.properties
         .headers as consumerSideMessageHearders;

      let currentRetryCount: number = headers['x-retry-count'] || 0;

      if (headers['x-death'] && headers['x-death'].length > 0) {
         currentRetryCount = headers['x-death'][0]?.count ?? 0;
      }

      const maxRetryAllowed: number = headers['x-max-retry'] ?? this.config.retry?.maxRetry ?? 0;

      const isRetryable =
         (this.config.processType === 'RETRY' || this.config.processType === 'RETRY_DLX') &&
         currentRetryCount < maxRetryAllowed;

      if (isRetryable && this.config.retry) {
         this.logger.info(
            `🔄 Message is retryable. Count: [${currentRetryCount + 1}/${maxRetryAllowed}]. Pushing to Retry Chain...`,
         );

         headers['x-retry-count'] = currentRetryCount + 1;
         headers['x-last-error'] = error.message;

         this.channel.publish(
            this.config.retry.retry_exchange,
            this.config.retry.retry_routingKey,
            msg.content,
            {
               headers: headers,
               persistent: true,
               messageId: msg.properties.messageId,
            },
         );

         this.channel.ack(msg);
      } else {
         this.logger.info(
            `⚠️ Max retries reached or process not retryable. Evaluating Dead-Letter/Drop Policy...`,
         );

         if (this.config.DLQ === null) {
            this.logger.info(
               ` DLQ is null for [${this.config.id}]. Rejecting message via NACK (Requeue: false) -> Message DROPPED.`,
            );
            this.channel.nack(msg, false, false);
         } else {
            this.logger.info(
               `💀 DLQ exists. Escalating to DLX Exchange: [${this.config.DLQ.dlx_exchange}] via NACK.`,
            );
            this.channel.nack(msg, false, false);
         }
      }
   }

   /**
    * @param msg
    * @param queueName
    *
    * When the message processed successfully then again I have to send the message to another queue that time I will use it.
    */
   protected abstract sendAnotherQueue(msg: amqp.ConsumeMessage, result: unknown): Promise<void>;

   /**
    * এই মেথডটি চাইল্ড ক্লাসে ওভাররাইড করে মেইন বিজনেস লজিক লিখতে হবে।
    * কোনো এরর হলে জাস্ট throw error; করে দিলে বাকিটা এই বেস ক্লাস হ্যান্ডেল করবে।
    */
   protected abstract processMessage(msg: JSON | string): Promise<any>;
}

/** 
@injectable()
export class Consumer extends BaseConsumer {


    constructor(        
        @inject(MQ_TOKENS.Channel)
        protected readonly channelModel: ChannelRecoveryModule,
        @inject(MQ_TOKENS.Logger) factory: LoggerFactory,
    ) {
        super(channelModel, factory)
    }

    protected async sendAnotherQueue(
        msg: amqp.ConsumeMessage,
        result: unknown
    ): Promise<void> { }

    protected async processMessage(msg: JSON | string): Promise<any> {
        
    }
}
*/
