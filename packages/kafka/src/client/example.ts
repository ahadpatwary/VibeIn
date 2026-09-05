// import { CompressionTypes, ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics, EachMessageHandler, EachMessagePayload, IHeaders, Kafka, KafkaConfig, KafkaMessage, Producer, ProducerBatch, ProducerConfig, ProducerRecord, TopicMessages } from 'kafkajs'

// const config: KafkaConfig = {
//     brokers: [],
//     clientId: '12345',
//     authenticationTimeout: 3000,
//     connectionTimeout: 3000,
//     enforceRequestTimeout: true,
//     // logCreator:
//     // logLeve
//     reauthenticationThreshold: 300,
//     requestTimeout: 3000,
//     retry: {
//         retries: 3,
//         factor: 0.2,
//         initialRetryTime: 3000,
//         maxRetryTime: 5000,
//         multiplier: 2,
//         // restartOnFailure: async (e: Error) => await true,
//     },
//     ssl: true,

// }

// const client: Kafka = new Kafka(config);

// const producerConfig: ProducerConfig = {
//     allowAutoTopicCreation: false,
//     idempotent: true,
//     transactionalId: "12345",
//     transactionTimeout: 3000,
//     retry: {
//         factor: 0.2,
//         initialRetryTime: 3000,
//         maxRetryTime: 5000,
//         multiplier: 2,
//         retries: 3,
//     },
//     // createPartitioner
//     // maxInFlightRequests
//     // metadataMaxAge
// }


// const producer: Producer = client.producer(producerConfig);


// producer.connect();
// const producerRecord: ProducerRecord = {
//     topic: 'orders',
//     acks: -1,
//     messages:[
//         {
//             key: 'key1',
//             value: 'ahad',
//             partition: 1,
//             timestamp: 'now',
//             headers: {

//             },
//         }
//     ],
//     // compression
//     timeout: 3000,
// }

// producer.send(producerRecord);

// const topicMessages: TopicMessages[] = [
//     {
//         topic: 'order_create',
//         messages: [
//             { 
//                 key: 'key1',
//                 value: 'ahad'
//             }
//         ]
//     },
//     {
//         topic: 'create_order',
//         messages: [
//             {
//                 key: 'key1',
//                 value: 'nahid'
//             }
//         ]
//     }
// ]

// const batch: ProducerBatch = {
//     acks: -1,
//     timeout: 3000,
//     compression: CompressionTypes.GZIP,
//     topicMessages: topicMessages,
// }

// producer.sendBatch(batch);

// const consumerConfig: ConsumerConfig = {
//     groupId: 'group1',
//     retry: {
//         factor: 0.2,
//         initialRetryTime: 2000,
//         maxRetryTime: 5000,
//         multiplier: 2,
//         // restartOnFailure
//         retries: 3,
//     }
// }
// const consumer = client.consumer(consumerConfig);

// consumer.connect();

// const consumerSubscribeTopic: ConsumerSubscribeTopics = {
//     topics: ['topic-1', 'topic-2'],
//     fromBeginning: false,
// }

// consumer.subscribe(consumerSubscribeTopic);

// const eachMessage = async (payload: EachMessagePayload) => {
//     const {
//         heartbeat,
//         message,
//         partition,
//         pause,
//         topic,
//     } = payload;

//     const {
//         attributes,
//         key,
//         offset,
//         timestamp,
//         value,
//         headers,
//         size,
//     }: KafkaMessage = message;
// }

// const consumerRunConfig: ConsumerRunConfig = {
//     autoCommit: false,
//     eachMessage: eachMessage,
// }
// await consumer.run(consumerRunConfig);