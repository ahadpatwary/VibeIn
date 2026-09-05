import { 
    Admin, 
    AdminConfig, 
    ConnectEvent, 
    Consumer, 
    ConsumerConfig, 
    ConsumerCrashEvent, 
    DisconnectEvent, 
    InstrumentationEvent, 
    Kafka, 
    KafkaConfig, 
    LogEntry, 
    Producer, 
    ProducerConfig, 
    SASLOptions,
} from "kafkajs";
import { KafkaClientConfig } from "../config/kafka.config";
import { mapKafkaError } from "../errors/kafka.error.mapper";



// export interface KafkaLoggerPort {
//     debug(message: string, meta?: Record<string, unknown>): void;
//     info(message: string, meta?: Record<string, unknown>): void;
//     warn(message: string, meta?: Record<string, unknown>): void;
//     error(message: string, meta?: Record<string, unknown>): void;
// }
 
// const LOG_LEVEL_MAP: Record<KafkaConfig['logLevel'], number> = {
//     NOTHING: KafkaLogLevel.NOTHING,
//     ERROR: KafkaLogLevel.ERROR,
//     WARN: KafkaLogLevel.WARN, 
//     INFO: KafkaLogLevel.INFO,
//     DEBUG: KafkaLogLevel.DEBUG,
// };
 


export class KafkaClientManager {
    private kafka: Kafka;
    private producerInstance: Producer | null = null;
    private adminInstance: Admin | null = null;
    private readonly activeConsumers: Set<Consumer> = new Set<Consumer>();

    private isAlreadyShuttingDown: boolean = false;
    private isProducerConnected: boolean = false;
    private isAdminConnected: boolean = false;


    constructor(
        private readonly config: KafkaClientConfig,
    ) {

        // super(config);

        const configuration: KafkaConfig = {
            clientId: this.config.clientId,
            brokers: this.config.brokers,
            ssl: this.config.ssl,
            // sasl: this.buildSaslOptions(),
            connectionTimeout: this.config.connectionTimeout,
            requestTimeout: this.config.requestTimeout,
            enforceRequestTimeout: this.config.enforceRequestTimeout,
            retry: {
                maxRetryTime: this.config.clientRetryMaxRetryTime,
                initialRetryTime: this.config.clientRetryInitialRetryTime,
                factor: this.config.clientRetryFactor,
                multiplier: this.config.clientRetryMultiplier,
                retries: this.config.clientRetryRetries,
            },
            // logLevel: LOG_LEVEL_MAP[this.config.logLevel],
            // logCreator: () => (entry: LogEntry) => this.forwardKafkaLog(entry),
            
        }

        this.kafka = new Kafka(configuration);
        
        this.#registerShutdownHooks();
    }

    private buildSaslOptions(): SASLOptions | undefined {
        if (!this.config.saslEnabled) return undefined;
    
        const username = this.config.saslUsername as string;
        const password = this.config.saslPassword as string;
    
        switch (this.config.saslMechanism) {
        case 'scram-sha-256':
            return { mechanism: 'scram-sha-256', username, password };
        case 'scram-sha-512':
            return { mechanism: 'scram-sha-512', username, password };
        case 'plain':
        default:
            return { mechanism: 'plain', username, password };
        }
    }

    // private forwardKafkaLog(entry: LogEntry): void {
    //     const { level, log } = entry;
    //     const meta = { namespace: log.namespace, ...log };
    //     switch (level) {
    //     case KafkaLogLevel.ERROR:
    //         this.logger.error(log.message, meta);
    //         break;
    //     case KafkaLogLevel.WARN:
    //         this.logger.warn(log.message, meta);
    //         break;
    //     case KafkaLogLevel.INFO:
    //         this.logger.info(log.message, meta);
    //         break;
    //     default:
    //         this.logger.debug(log.message, meta);
    //     }
    // }

    public async getProducer(): Promise<Producer> {
        if(this.producerInstance && this.isProducerConnected) {
            return this.producerInstance;
        }

        if(!this.producerInstance) {

            const producerConfig: ProducerConfig = {
                allowAutoTopicCreation: false,
                // createPartitioner: 
                idempotent: true,
                transactionalId: '',
                transactionTimeout: 3000,
                // maxInFlightRequests: 
                metadataMaxAge: 30,
                retry: {
                    factor: 0.2,
                    initialRetryTime: 2000,
                    maxRetryTime: 5000,
                    multiplier: 2,
                    retries: 3,
                    // restartOnFailure
                }
            }

            this.producerInstance = this.kafka.producer(producerConfig);
        }

        this.#registerProducerEvent(this.producerInstance);

        try {
            await this.producerInstance.connect();
            this.isProducerConnected = true;
        } catch (error) {
            throw mapKafkaError(error, 'connect', { component: 'producer' });
        }
        return this.producerInstance;
    }

    public async getAdimn(): Promise<Admin> {
        if(this.adminInstance && this.isAdminConnected) {
            return this.adminInstance;
        }

        if(!this.adminInstance) {

            const adminConfig: AdminConfig = {
                retry: {
                    factor: 0.2,
                    initialRetryTime: 2000,
                    maxRetryTime: 5000,
                    multiplier: 2,
                    // restartOnFailure
                }
            }

            this.adminInstance = this.kafka.admin(adminConfig);
        } 

        this.#registerAdminEvent(this.adminInstance);

        try {
            await this.adminInstance.connect();
            this.isAdminConnected = true;
        } catch (error) {
            throw mapKafkaError(error, 'connect', { component: 'admin' });
        }

        return this.adminInstance;
    }

    public async createConsumer(overrides: Partial<ConsumerConfig>): Promise<Consumer> {
        
        const consumerConfig: ConsumerConfig = {
            groupId: 'default',
            allowAutoTopicCreation: false,
            heartbeatInterval: 60,
            // maxBytes
            // maxBytesPerPartition
            // maxInFlightRequests
            // maxWaitTimeInMs
            // metadataMaxAge
            // minBytes
            // partitionAssigners
            // rackId
            // readUncommitted
            // rebalanceTimeout
            // sessionTimeout
            retry: {
                factor: 0.2,
                initialRetryTime: 2000,
                maxRetryTime: 5000,
                multiplier: 2,
                retries: 5,
                // restartOnFailure
            },
            ...overrides
        }

        const consumer: Consumer = this.kafka.consumer(consumerConfig);

        this.#registerConsumerEvent(consumer);

        try {
            await consumer.connect();
            this.activeConsumers.add(consumer);
        } catch (error) {
            throw mapKafkaError(error, 'connect', { component: 'consumer' });
        }

        return consumer;

    }

    public async disconnectAll(): Promise<void> {

        if(this.isAlreadyShuttingDown) return;
        this.isAlreadyShuttingDown = true;

        const disconnectTask: Promise<void>[] = [];

        disconnectTask.push(this.#disconnectProducer());
        disconnectTask.push(this.#disconnectAdmin());

        for(const consumer of this.activeConsumers) {
            disconnectTask.push(this.#disconnectConsumer(consumer));
        }

        await Promise.allSettled(disconnectTask);
    }

    async #disconnectConsumer(consumer: Consumer): Promise<void> {
        try {
            await consumer.disconnect();
        } catch (error) {
            mapKafkaError(error, 'disconnect')
        } finally {
            this.activeConsumers.delete(consumer);
        }
    }

    async #disconnectProducer(): Promise<void> {
        try {
            await this.producerInstance?.disconnect();
        } catch (error) {
            //error handling
        } finally {
            this.producerInstance = null;
            this.isProducerConnected = false;
        }
    }

    async #disconnectAdmin(): Promise<void> {
        try {
            await this.adminInstance?.disconnect();
        } catch (error) {
            // error handling
        } finally {
            this.adminInstance = null;
            this.isAdminConnected = false;
        }
    }


    #registerAdminEvent(adminInstance: Admin): void {
        adminInstance.on('admin.connect', (event: ConnectEvent) => {
            this.isAdminConnected = true;
            console.log("admin connected");
        })

        adminInstance.on("admin.disconnect", (event: DisconnectEvent) => {
            this.isAdminConnected = false;
            console.log("admin disconnected");
        })
    }


    #registerProducerEvent(producerInstance: Producer): void {
        producerInstance.on("producer.connect", (event: ConnectEvent) => {
            this.isProducerConnected = true;
            console.log('Producer connected');
        })

        producerInstance.on("producer.disconnect", (event: DisconnectEvent) => {
            this.isProducerConnected = false;
            console.log("Producer disconnected");
        })
    }

    #registerConsumerEvent(consumer: Consumer): void {
        consumer.on('consumer.connect', (event: ConnectEvent) => {
            console.log("consumer connected");
        })

        consumer.on('consumer.crash', (event: ConsumerCrashEvent) => {
            console.log('consumer crush');
        })

        consumer.on('consumer.disconnect', (event: DisconnectEvent) => {
            console.log('consumer diconnect');
        })

        consumer.on('consumer.stop', (event: InstrumentationEvent<null>) => {
            console.log('consumer stop')
        })
    }

    async #registerShutdownHooks(): Promise<void> {
        const shutdown = async (signal: string) => {
            // this.logger.info(`Received ${signal}, initiating Kafka graceful shutdown`);
            await this.disconnectAll();
        };
    
        process.once('SIGTERM', () => void shutdown('SIGTERM'));
        process.once('SIGINT', () => void shutdown('SIGINT'));
    }
}