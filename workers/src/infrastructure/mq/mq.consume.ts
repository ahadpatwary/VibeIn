import amqp from 'amqplib';
import { QueueConfigItemSchema } from './your-zod-schema-file'; // জোড স্কিমা পাথ
import { QueueRegistry } from './your-config-file'; // কনফিগারেশন পাথ
import { Injectable } from '@nestjs/common';
import { RabbitMQConsumerStartException } from './exceptions/mq.exceptions';

@Injectable()
export abstract class BaseConsumer {
    protected channel!: amqp.Channel;
    protected config!: any;

    constructor(
        protected connection: amqp.RecoveringChannelModel,
        protected readonly serviceId: string,
    ) {
        // ১. ফার্স্টেই কনফিগারেশন ফাইল থেকে সার্ভিস আইডি অনুযায়ী ডেটা বের করে ভ্যালিডেট করা
        const rawConfig = QueueRegistry.find(
            (item) => item.id === this.serviceId,
        );
        if (!rawConfig) {
            throw new Error(
                `[Consumer Error] Configuration not found for service ID: ${this.serviceId}`,
            );
        }

        // জোড দিয়ে রানটাইম সেফটি চেক
        this.config = QueueConfigItemSchema.parse(rawConfig);
    }

    /**
     * কনজিউমার স্টার্ট করার মেইন মেথড
     */
    public async start(): Promise<void> {
        this.channel = await this.connection.createChannel();

        // প্রিফেচ সেট করা যাতে একটা কনজিউমার একসাথে সব মেসেজ নিয়ে মেমোরি জ্যাম না করে
        await this.channel.prefetch(10);

        console.log(
            `🚀 Consumer started for queue: [${this.config.queueName}]`,
        );

        await this.consumer(
            this.config.queueName,
            this.handleMessageProcessing,
        );
    }

    private async consumer(
        queue: string,
        onMessage: (msg: amqp.ConsumeMessage | null) => void,
        options?: amqp.Options.Consume,
    ): Promise<amqp.Replies.Consume> {
        const opt: amqp.Options.Consume = {
            exclusive: false,
            noAck: false,
            ...options,
        };

        try {
            const reply = await this.channel.consume(queue, onMessage, opt);
            return reply;
        } catch (error) {
            throw new RabbitMQConsumerStartException(queue, error as Error);
        }
    }

    private async handleMessageProcessing(
        msg: amqp.ConsumeMessage | null,
    ): Promise<void> {
        if (msg === null) return;

        try {
            const result = await this.onMessage('ahad'); // letter push msg

            console.log(
                `Message processed successfully for ID: ${this.config.id}`,
            );

            if (msg.properties.replyTo) {
                const replyQueue = msg.properties.replyTo;
                const correlationId = msg.properties.correlationId;

                console.log(
                    ` └─ Found replyTo. Routing response to queue: [${replyQueue}]`,
                );

                this.channel.sendToQueue(
                    replyQueue,
                    Buffer.from(
                        JSON.stringify({ success: true, data: result }),
                    ),
                    { correlationId },
                );
            }

            this.channel.ack(msg);
        } catch (error: any) {
            // 🔴 ERROR FLOW (Retry -> DLQ / Drop Mechanism)
            console.error(
                `Error parsing message in [${this.config.id}]:`,
                error.message,
            );
            await this.handleFailureFlow(msg, error);
        }
    }

    private async handleFailureFlow(
        msg: amqp.ConsumeMessage,
        error: Error,
    ): Promise<void> {
        const headers = msg.properties.headers || {};

        let currentRetryCount = headers['x-retry-count'] || 0;

        if (headers['x-death'] && headers['x-death'].length > 0) {
            currentRetryCount = headers['x-death'][0].count;
        }

        const maxRetryAllowed = this.config.retry?.maxRetry || 0;

        const isRetryable =
            (this.config.processType === 'RETRY' ||
                this.config.processType === 'RETRY_DLX') &&
            currentRetryCount < maxRetryAllowed;

        if (isRetryable && this.config.retry) {
            console.log(
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
            console.log(
                `⚠️ Max retries reached or process not retryable. Evaluating Dead-Letter/Drop Policy...`,
            );

            if (this.config.DLQ === null) {
                console.log(
                    ` DLQ is null for [${this.config.id}]. Rejecting message via NACK (Requeue: false) -> Message DROPPED.`,
                );
                this.channel.nack(msg, false, false);
            } else {
                console.log(
                    `💀 DLQ exists. Escalating to DLX Exchange: [${this.config.DLQ.dlx_exchange}] via NACK.`,
                );
                this.channel.nack(msg, false, false);
            }
        }
    }

    /**
     * এই মেথডটি চাইল্ড ক্লাসে ওভাররাইড করে মেইন বিজনেস লজিক লিখতে হবে।
     * কোনো এরর হলে জাস্ট throw error; করে দিলে বাকিটা এই বেস ক্লাস হ্যান্ডেল করবে।
     */
    protected abstract onMessage(msg: JSON | string): Promise<any>;
}
