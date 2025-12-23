import amqp, { Connection, Channel } from "amqplib";

let connection: Connection | null = null;
let channel: Channel | null = null;

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";

export const connectToRabbitMQ = async (): Promise<{
  connection: Connection;
  channel: Channel;
}> => {
  try {
    // 🔹 Connection create (only once)
    if (!connection) {
      connection = await amqp.connect(RABBIT_URL);

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        connection = null;
      });

      connection.on("close", () => {
        console.warn("RabbitMQ connection closed");
        connection = null;
      });
    }

    // 🔹 Channel create (only once)
    if (!channel) {
      channel = await connection.createChannel();

      channel.on("error", (err) => {
        console.error("RabbitMQ channel error:", err);
        channel = null;
      });

      channel.on("close", () => {
        console.warn("RabbitMQ channel closed");
        channel = null;
      });
    }

    return { connection, channel };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error("RabbitMQ connection failed: " + error.message);
    }
    throw error;
  }
};