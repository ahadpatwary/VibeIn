import { getRedisClient } from '../lib/redis';
import { getRabbitChannel } from './../lib/rabbitMQ';
// import { transporter } from '../lib/nodemailerSetup';

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

            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

            const Redis = getRedisClient();

            if(!Redis) return;

            await Redis.set(`emailOtp:${data.email}`, randomOtp, "EX", 3 * 60);

            console.log("REDIS OTP: ", randomOtp);

            // await transporter.sendMail({
            //     from: '"VibeIn" <no-reply@VibeIn.com>',
            //     to: data.email,
            //     subject: "Your OTP Code",
            //     html: `
            //     <h2>Your OTP Code</h2>
            //     <p>Your verification code is:</p>
            //     <h1>${randomOtp}</h1>
            //     <p>This code will expire in 3 minutes.</p>
            //     `,
            // });

            channel.ack(msg);

        } catch (err) {
            console.error("Error processing message", err);
            channel.nack(msg, false, false);
        }
        },
        { noAck: false }
    );
}

startConsumer();