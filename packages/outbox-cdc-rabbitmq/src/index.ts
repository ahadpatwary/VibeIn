import "reflect-metadata";
import { Schema, model } from "mongoose";
import { container, registerCoreDependencies } from "./di/container";
import { OutboxWriterService } from "./outbox/outbox-writer.service";
import { bootstrapOutboxRelay } from "./bootstrap";

// --- example domain model (your real Order model already exists) ---
interface OrderDoc {
  merchantId: string;
  customerPhone: string;
  status: string;
  totalAmount: number;
}
const orderSchema = new Schema<OrderDoc>({
  merchantId: String,
  customerPhone: String,
  status: String,
  totalAmount: Number,
});
const OrderModel = model<OrderDoc>("Order", orderSchema);

async function main() {
  registerCoreDependencies("orderbari-order-service");

  // Starts: Mongo connect, RabbitMQ connect, change stream watcher, reconciliation job.
  await bootstrapOutboxRelay("orderbari-order-service");

  const outboxWriter = container.resolve(OutboxWriterService);

  // --- example: creating an order emits "order.created" atomically ---
  // The event builder runs AFTER the insert (still inside the same
  // transaction), so it can safely reference the generated _id.
  const order = await outboxWriter.writeWithOutbox(
    async (session) => {
      const [doc] = await OrderModel.create(
        [{ merchantId: "m_123", customerPhone: "+8801XXXXXXXXX", status: "PENDING", totalAmount: 1250 }],
        { session }
      );
      return doc;
    },
    (createdOrder) => ({
      aggregateType: "Order",
      aggregateId: createdOrder._id.toString(),
      eventType: "order.created",
      payload: {
        merchantId: createdOrder.merchantId,
        totalAmount: createdOrder.totalAmount,
        status: createdOrder.status,
      },
    })
  );

  console.log("Order created + outbox event queued for CDC pickup:", order._id);
}

main().catch((err) => {
  console.error("Fatal error during bootstrap:", err);
  process.exit(1);
});