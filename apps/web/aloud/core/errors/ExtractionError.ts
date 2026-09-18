import { AppError } from "./AppError";

/** Base class for anything that goes wrong while reading or demuxing the file. */
export abstract class ExtractionError extends AppError {}

export class UnsupportedFileError extends ExtractionError {
  public readonly code = "extraction/unsupported_file";

  constructor(fileType: string, cause?: unknown) {
    super(`"${fileType || "unknown"}" isn't a container this tool can parse.`, cause);
  }

  public override toUserMessage(): string {
    return "This file format isn't supported. Try an MP4, MOV, or M4V container.";
  }
}

export class NoAudioTrackError extends ExtractionError {
  public readonly code = "extraction/no_audio_track";

  constructor(cause?: unknown) {
    super("The container has no audio track to demux.", cause);
  }

  public override toUserMessage(): string {
    return "This video doesn't have an audio track to extract.";
  }
}

export class DemuxError extends ExtractionError {
  public readonly code = "extraction/demux_failed";

  constructor(reason: string, cause?: unknown) {
    super(`Demuxing failed: ${reason}`, cause);
  }

  public override toUserMessage(): string {
    return "Something went wrong while separating the audio track. The file may be corrupted or use an unsupported codec.";
  }
}

export class FileReadError extends ExtractionError {
  public readonly code = "extraction/file_read_failed";

  constructor(cause?: unknown) {
    super("Reading the source file from disk failed.", cause);
  }

  public override toUserMessage(): string {
    return "The file couldn't be read. Try selecting it again.";
  }
}
