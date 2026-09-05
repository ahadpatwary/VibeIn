import { 
    Kafka,
    Consumer 
} from "kafkajs";
import { KafkaClientManager } from "../client/kafka.client";




export class kafkaConsumerService {

    constructor(
        private readonly clientManager: KafkaClientManager,
    ) {}

    public async consumer() {
        const consume = await this.clientManager.createConsumer({});
        (await consume).subscribe({
            topic: 'topic1'
        })

        ;(await consume).run({
            partitionsConsumedConcurrently: 5,

        })

        
    }

    
}