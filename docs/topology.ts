import amqp from 'amqplib';
import { QueueRegistrySchema } from './your-zod-schema-file.js'; // তোমার জোড ফাইলের পাথ
import { QueueRegistry } from './your-config-file.js'; // তোমার কনফিগারেশন ফাইলের পাথ


export async function initializeRabbitMQ(
    connection: amqp.Connection,
): Promise<void> {
    const channel = await connection.createChannel();
    console.log('🔄 Initializing RabbitMQ Topology...');

    try {
        // ১. রানটাইমেই জোড দিয়ে পুরো রেজিস্ট্রি ভ্যালিডেশন করা হচ্ছে
        // কোনো টাইপো বা আর্কিটেকচারাল মিসম্যাচ থাকলে এখানেই ক্র্যাশ করবে
        const validatedRegistry = QueueRegistrySchema.parse(QueueRegistry);

        for (const config of validatedRegistry) {
            console.log(
                `\n📦 Configuring Toplogy for Service ID: [${config.id}] | Type: [${config.processType}]`,
            );

            // ==========================================
            // ২. DLQ (Dead Letter Queue) ইনফ্রাস্ট্রাকচার ইনিশিয়েট করা
            // ==========================================
            if (
                config.processType === 'NORMAL_DLX' ||
                config.processType === 'RETRY_DLX'
            ) {
                if (config.DLQ) {
                    console.log(
                        `  └─ 💀 Creating DLQ Exchange: ${config.DLQ.dlx_exchange}`,
                    );
                    await channel.assertExchange(
                        config.DLQ.dlx_exchange,
                        'topic',
                        config.DLQ.dlx_exchangeOptions || { durable: true },
                    );

                    console.log(
                        `  └─ 💀 Creating DLQ Queue: ${config.DLQ.dlx_queue}`,
                    );
                    await channel.assertQueue(
                        config.DLQ.dlx_queue,
                        config.DLQ.dlx_queueOptions || { durable: true },
                    );

                    console.log(
                        `  └─ 💀 Binding DLQ Queue to DLQ Exchange with key: ${config.DLQ.dlx_routingKey}`,
                    );
                    await channel.bindQueue(
                        config.DLQ.dlx_queue,
                        config.DLQ.dlx_exchange,
                        config.DLQ.dlx_routingKey,
                        config.DLQ.dlx_bindingArg,
                    );
                }
            }

            // ==========================================
            // ৩. RETRY Queue ইনফ্রাস্ট্রাকচার ইনিশিয়েট করা
            // ==========================================
            if (
                config.processType === 'RETRY' ||
                config.processType === 'RETRY_DLX'
            ) {
                if (config.retry) {
                    console.log(
                        `  └─ 🔄 Creating Retry Exchange: ${config.retry.retry_exchange}`,
                    );
                    await channel.assertExchange(
                        config.retry.retry_exchange,
                        'topic',
                        config.retry.retry_exchangeOptions || { durable: true },
                    );

                    console.log(
                        `  └─ 🔄 Creating Retry Queue: ${config.retry.retry_queue}`,
                    );
                    await channel.assertQueue(
                        config.retry.retry_queue,
                        config.retry.retry_queueOptions, // এতে messageTtl ও DLX ম্যাপ করা আছে
                    );

                    console.log(
                        `  └─ 🔄 Binding Retry Queue to Retry Exchange with key: ${config.retry.retry_routingKey}`,
                    );
                    await channel.bindQueue(
                        config.retry.retry_queue,
                        config.retry.retry_exchange,
                        config.retry.retry_routingKey,
                        config.retry.retry_bindingArgs,
                    );
                }
            }

            // ==========================================
            // ৪. MAIN Queue ইনফ্রাস্ট্রাকচার ইনিশিয়েট করা
            // ==========================================
            console.log(`  └─ 🚀 Creating Main Queue: ${config.queueName}`);
            await channel.assertQueue(
                config.queueName,
                config.queueOptions, // DLX প্রসেস হলে জোড অলরেডি নিশ্চিত করেছে এখানে DLX আর্গুমেন্ট আছে
            );

            // ==========================================
            // ৫. ডাইনামিক বাইন্ডিংস অ্যারে প্রসেস করা
            // ==========================================
            console.log(
                `  └─ 🔗 Processing ${config.bindings.length} External Exchange Bindings...`,
            );
            for (const binding of config.bindings) {
                // মেইন কিউ যে যে এক্সচেঞ্জের সাথে কানেক্ট হতে চায়, সেগুলো তৈরি করা হচ্ছে (যদি না থাকে)
                await channel.assertExchange(
                    binding.exchangeName,
                    'topic',
                    (binding as any).exchangeOptions || { durable: true },
                );

                // মেইন কিউকে এক্সচেঞ্জ ও রাউটিং কি-এর সাথে বাইন্ড করা
                console.log(
                    `     ├─ Binding Main Queue to [${binding.exchangeName}] using RoutingKey: [${binding.routingKey}]`,
                );
                await channel.bindQueue(
                    config.queueName,
                    binding.exchangeName,
                    binding.routingKey,
                    binding.bindingArgs,
                );
            }
        }

        console.log(
            '\n✅ RabbitMQ Topology successfully initialized and verified!',
        );
    } catch (error) {
        console.error('❌ Failed to initialize RabbitMQ topology:', error);
        throw error; // প্রজেক্ট ক্র্যাশ করানো উচিত যাতে ভুল আর্কিটেকচার নিয়ে সিস্টেম রান না হয়
    } finally {
        await channel.close();
    }
}
