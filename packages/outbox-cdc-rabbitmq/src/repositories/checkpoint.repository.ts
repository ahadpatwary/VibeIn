import { injectable, singleton } from "tsyringe";
import { ChangeStreamCheckpointModel } from "../models/change-stream-checkpoint.model";
import { mapChangeStreamError } from "../errors/change-stream.errors";

@injectable()
@singleton()
export class CheckpointRepository {
  async getResumeToken(watcherId: string): Promise<Record<string, unknown> | null> {
    const doc = await ChangeStreamCheckpointModel.findOne({ watcherId }).lean().exec();
    return doc?.resumeToken ?? null;
  }

  async saveResumeToken(watcherId: string, resumeToken: Record<string, unknown>): Promise<void> {
    try {
      await ChangeStreamCheckpointModel.updateOne(
        { watcherId },
        { $set: { resumeToken } },
        { upsert: true }
      ).exec();
    } catch (err) {
      throw mapChangeStreamError(err);
    }
  }

  async clearResumeToken(watcherId: string): Promise<void> {
    await ChangeStreamCheckpointModel.deleteOne({ watcherId }).exec();
  }
}
