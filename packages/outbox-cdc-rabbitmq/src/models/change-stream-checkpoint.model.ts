import { Schema, model, type Document, type Model } from "mongoose";

export interface ChangeStreamCheckpointDocument extends Document {
  watcherId: string; // e.g. "outbox_events_watcher" — one row per logical watcher
  resumeToken: Record<string, unknown>;
  updatedAt: Date;
}

const checkpointSchema = new Schema<ChangeStreamCheckpointDocument>(
  {
    watcherId: { type: String, required: true, unique: true, index: true },
    resumeToken: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: false, updatedAt: true }, collection: "change_stream_checkpoints" }
);

export const ChangeStreamCheckpointModel: Model<ChangeStreamCheckpointDocument> = model<ChangeStreamCheckpointDocument>(
  "ChangeStreamCheckpoint",
  checkpointSchema
);
