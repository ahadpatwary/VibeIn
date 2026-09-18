import { Emitter } from "../events/Emitter";
import { AppError } from "../errors/AppError";
import { AudioTrackDemuxer } from "../extraction/AudioTrackDemuxer";
import { HttpUploadClient, type UploadClient } from "../upload/UploadClient";
import type { PipelineEvents, PipelineResult, PipelineStage } from "./types";

/**
 * Orchestrates a single file end to end: demux -> package -> upload.
 *
 * This is the one class the UI layer talks to. It owns no DOM state —
 * `useExtractionPipeline` (a hook) is the thin adapter that mirrors this
 * class's events into React state.
 */
export class ExtractionPipeline extends Emitter<PipelineEvents> {
  private readonly uploadClient: UploadClient;
  private stage: PipelineStage = "idle";

  constructor(uploadClient: UploadClient = new HttpUploadClient()) {
    super();
    this.uploadClient = uploadClient;
  }

  public getStage(): PipelineStage {
    return this.stage;
  }

  public async run(file: File): Promise<PipelineResult> {
    try {
      const demuxer = new AudioTrackDemuxer(file);
    
      demuxer.on("progress", (progress) => {
        this.setStage(progress.stage);
        this.emit("demux-progress", progress);
      });

      const demuxResult = await demuxer.run();
      this.setStage("packaging");

      const audioFileName = this.deriveAudioFileName(file.name);

      this.setStage("uploading");
      const unsubscribe = this.uploadClient.on("progress", (progress) => {
        this.emit("upload-progress", progress);
      });
      // const uploadResult = await this.uploadClient.upload(demuxResult.blob, audioFileName);
      // unsubscribe();

      const result: PipelineResult = {
        track: demuxResult.track,
        blob: demuxResult.blob,
        fileName: audioFileName,
        sourceSizeBytes: demuxResult.sourceSizeBytes,
        // fileKey: uploadResult.fileKey,
        fileKey: 'ahad123'
      };

      this.setStage("done");
      this.emit("done", result);
      return result;
    } catch (error) {
      this.setStage("error");
      const appError = this.toAppError(error);
      this.emit("error", { error: appError });
      throw appError;
    }
  }

  private setStage(stage: PipelineStage): void {
    this.stage = stage;
    this.emit("stage", { stage });
  }

  private deriveAudioFileName(sourceFileName: string): string {
    const withoutExtension = sourceFileName.replace(/\.[^/.]+$/, "");
    return `${withoutExtension || "audio"}.m4a`;
  }

  private toAppError(error: unknown): AppError {
    if (error instanceof AppError) return error;
    return new UnknownPipelineError(error);
  }
}

/** Catch-all for anything unexpected that isn't already an `AppError`. */
class UnknownPipelineError extends AppError {
  public readonly code = "pipeline/unknown";

  constructor(cause: unknown) {
    super("Something unexpected went wrong.", cause);
  }

  public override toUserMessage(): string {
    return "Something unexpected went wrong. Please try again.";
  }
}
