import { connectToRabbitMQ, getRabbitChannel } from './../lib/rabbitMQ';

async function startConsumer() {

    const channel = await getRabbitChannel();

    const QUEUE_NAME = "emailNotificationQueue";

    await channel.assertQueue(QUEUE_NAME, {
        durable: true,
    });

    console.log("Waiting for messages...");

    channel.consume(
        QUEUE_NAME,
        async (msg) => {
        if (!msg) return;

        try {
            // 🔹 message content access
            const content = msg.content.toString();
            const data = JSON.parse(content);

            console.log("Received message:", data);
            // data.email এখানে পাওয়া যাবে

            // 👉 এখানে email send logic লিখবে
            // await sendEmail(data.email);

            // ✅ successful হলে acknowledge
            channel.ack(msg);
        } catch (err) {
            console.error("Error processing message", err);

            // ❌ error হলে requeue false (না হলে infinite loop হবে)
            channel.nack(msg, false, false);
        }
        },
        {
            noAck: false, // IMPORTANT
        }
    );
}

startConsumer();