import { inject, injectable } from "tsyringe";
import { MQ_TOKENS } from "./tokens/tokens";
import { ILogger, LOGGER_TOKENS, LoggerFactory } from "@app/logger";
import { ProcessType, QueueConfigItem, QueueRegistrySchema } from "./configuration";
import { QueueInit } from "./mq.queueInit";
import { channelOptions } from "./types/mq.types";


export const channelOpts: channelOptions = {
    name: 'initQueueCHannel',
    prefetch: 5,
}


@injectable()
export class SetUpMq {
    private readonly logger: ILogger;
    
    constructor(
        @inject(MQ_TOKENS.QueueInit)
        private readonly queueInit: QueueInit,
        @inject(MQ_TOKENS.QueueConfig)
        private readonly config: QueueConfigItem<ProcessType>,
        @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
    ) {
        this.logger = factory.forModule("RABBITMQ_MODULE");
    }

    /** initiliase the queue and connection */
    async init(): Promise<void> {
        const validatedRegistry = QueueRegistrySchema.parse(this.config);


        for(const config of validatedRegistry) {

            /** -> DLQ init with profer config */
            if(
                config.processType === 'NORMAL_DLX' ||  
                config.processType === 'RETRY_DLX'
            ) {
       
                if(!config.DLQ) return;

                await this.queueInit.assertExchange(
                    channelOpts,
                    config.DLQ.dlx_exchange,
                    'topic',
                    // config.DLQ.,
                )

               
                await this.queueInit.assertQueue(
                    channelOpts,
                    config.DLQ.dlx_queue,
                    // config.DLQ.
                )

                 
                await this.queueInit.customBindQueue(
                    channelOpts,
                    config.DLQ.dlx_queue,
                    config.DLQ.dlx_exchange,
                    config.DLQ.dlx_routingKey,
                    config.DLQ.dlx_bindingArg,
                );
            }


            /** -> Retry Queue init with profer config */
            if(
                config.processType === 'RETRY' ||
                config.processType === 'RETRY_DLX'
            ) {
                   
                if(!config.retry) return;

                await this.queueInit.assertExchange(
                    channelOpts,
                    config.retry.retry_exchange,
                    'topic',
                    // config.retry.
                );

                    
                await this.queueInit.assertQueue(
                    channelOpts,
                    config.retry.retry_queue,
                    config.retry.retry_queueOptions, 
                );

               
                await this.queueInit.customBindQueue(
                    channelOpts,
                    config.retry.retry_queue,
                    config.retry.retry_exchange,
                    config.retry.retry_routingKey,
                    config.retry.retry_bindingArgs,
                );
            }


            /** -> Main queue init with proper config */
                        
            await this.queueInit.assertQueue(
                channelOpts,
                config.queueName,
                config.queueOptions, 
            );

       
            for (const binding of config.bindings) {
                
                await this.queueInit.assertExchange(
                    channelOpts,
                    binding.exchangeName,
                    'topic',
                    (binding as any).exchangeOptions || { durable: true },
                );

            
                await this.queueInit.customBindQueue(
                    channelOpts,
                    config.queueName,
                    binding.exchangeName,
                    binding.routingKey,
                    binding.bindingArgs,
                );
            }
        }
    }
}