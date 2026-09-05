import { CompressionTypes, IHeaders, Message, Producer, ProducerBatch, ProducerConfig, ProducerRecord, TopicMessages, Transaction } from "kafkajs";
import { KafkaClientManager } from "../client/kafka.client";
import { mapKafkaError } from "../errors/kafka.error.mapper";



export class KafkaProducerService {

    constructor(
        private readonly clientManager: KafkaClientManager,
    ){}


    public async publish(
        options: ProducerRecord, 
        transaction?: Transaction
    ): Promise<void> {

        const record: ProducerRecord = {
            acks: -1,
            compression: CompressionTypes.GZIP,
            timeout: 3000,

            ...options,
        }

        try {
            const producer = transaction ?? await this.clientManager.getProducer();
            await producer.send(record);
            
        } catch (error) {
            throw mapKafkaError(error, 'produce', {
                context: "publisih message",
                topic: options.topic,
            })
        }

    }

    public async publishMultiTopic(
        options: ProducerBatch,
        transaction: Transaction
    ): Promise<void> {

        
        const batch: ProducerBatch = {
            topicMessages: [],
            acks: -1, 
            compression: CompressionTypes.GZIP,
            timeout: 3000,

            ...options,
        }

        try {
            const producer = transaction ?? await this.clientManager.getProducer();
            await producer.sendBatch(batch);
        } catch (error) {
            throw mapKafkaError(error, 'produce', {
                context: 'publis batch messages',
            })
        }

    }

    public async publishToDLQ(
        originalTopic: string,
        message: Message,
        maxTime: string,
        error: unknown,
    ) {
        const dlqTopic = `DLQ-${originalTopic}`;

        const record: ProducerRecord = {
            topic: dlqTopic,
            acks: -1,
            compression: CompressionTypes.GZIP,
            messages: [
                {
                    key: message.key,
                    value: message.value,
                    timestamp: message.timestamp ?? new Date().toISOString(),
                    partition: message.partition,
                    headers: {
                        'x-original-topic': originalTopic,
                        'x-error-reason': error instanceof Error ? error.message : String(error),
                        'x-failed-at': new Date().toISOString(),
                        'x-max-processTime': maxTime ?? 'INFINITE',
                    }
                }
            ],
            timeout: 3000,
        }

        try {
            const producer = await this.clientManager.getProducer();
            await producer.send(record);
        } catch (error) {
            throw mapKafkaError(error, 'produce', {
                context: 'publish message to DeadletterTopic',
                topic: originalTopic,
                key: message.key,
            })
        }
    }

    public async getTransaction(): Promise<Transaction | void> {
        try {
            const producer = await this.clientManager.getProducer();
            const transacton = await producer.transaction();
            return transacton;
        } catch (error) {
            // error handling
        }
    }

    // #modifyMessage(opts: Message): Promise<void> {

    //     const idempotencyKey = opts.idempotencyKey ?? randomUUID();
    
    //     return {
    //         key: opts.key,
    //         value: this.serialize(opts.value),
    //         partition: opts.partition,
    //         headers: {
    //             ...opts.headers,
    //             'x-idempotency-key': idempotencyKey,
    //             'x-produced-at': new Date().toISOString(),
    //         },
    //     };
    // }
    
}