import { Schema, model, type Document, type Model } from "mongoose";

export enum OutboxEventStatus {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
}

export interface OutboxEventDocument extends Document {
  eventId: string; // UUID, used as RabbitMQ message ID for idempotent consumers
  aggregateType: string; // e.g. "Order"
  aggregateId: string; // e.g. the Order's _id as string
  eventType: string; // e.g. "order.created" — used as routing key
  payload: Record<string, unknown>;
  metadata: {
    occurredAt: Date;
    source: string; // service name that produced the event
    correlationId?: string;
    causationId?: string;
  };
  status: OutboxEventStatus;
  retryCount: number;
  lastError?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const outboxEventSchema = new Schema<OutboxEventDocument>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    aggregateType: { type: String, required: true, index: true },
    aggregateId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    metadata: {
      occurredAt: { type: Date, required: true, default: () => new Date() },
      source: { type: String, required: true },
      correlationId: { type: String },
      causationId: { type: String },
    },
    status: {
      type: String,
      enum: Object.values(OutboxEventStatus),
      default: OutboxEventStatus.PENDING,
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    lastError: { type: String },
    publishedAt: { type: Date },
  },
  { timestamps: true, collection: "outbox_events" }
);

// Compound index for the reconciliation sweep: find stale PENDING docs fast.
outboxEventSchema.index({ status: 1, createdAt: 1 });

export const OutboxEventModel: Model<OutboxEventDocument> = model<OutboxEventDocument>(
  "OutboxEvent",
  outboxEventSchema
);
