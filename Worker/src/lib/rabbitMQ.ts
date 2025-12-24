import { connect, ChannelModel, Channel } from "amqplib";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";


export const connectToRabbitMQ = async (): Promise<{
  connection: ChannelModel;
  channel: Channel;
}> => {
  try {
    if (!connection) {
      const conn = await connect(RABBIT_URL);
      connection = conn;

      conn.on("error", (err: Error) => {
        console.error("RabbitMQ connection error:", err);
        connection = null;
      });

      conn.on("close", () => {
        console.warn("RabbitMQ connection closed");
        connection = null;
      });
    }

    if (!channel) {
      // Use local variable to keep TS narrow
      const ch = await connection!.createChannel();
      channel = ch;

      ch.on("error", (err: Error) => {
        console.error("RabbitMQ channel error:", err);
        channel = null;
      });

      ch.on("close", () => {
        console.warn("RabbitMQ channel closed");
        channel = null;
      });
    }

    if (!connection || !channel) {
      throw new Error("Failed to establish RabbitMQ connection or channel");
    }

    return { connection, channel };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("RabbitMQ connection failed: " + error.message);
    }
    throw error;
  }
};

/**
 * Returns a usable channel, creating the connection/channel if needed.
 */
export const getRabbitChannel = async (): Promise<Channel> => {
  const { channel: ch } = await connectToRabbitMQ();
  return ch;
};

/**
 * Closes the channel and connection gracefully.
 */
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }

    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (err) {
    console.error("Error closing RabbitMQ:", err);
  }
};
