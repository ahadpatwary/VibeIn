import { AppError } from "./AppError";

/** Base class for anything that goes wrong handing the extracted audio to the backend. */
export abstract class UploadError extends AppError {}

export class PresignRequestError extends UploadError {
  public readonly code = "upload/presign_failed";

  constructor(status?: number, cause?: unknown) {
    super(`Failed to obtain an upload URL${status ? ` (HTTP ${status})` : ""}.`, cause);
  }

  public override toUserMessage(): string {
    return "Couldn't start the upload. Please try again in a moment.";
  }
}

export class UploadTransportError extends UploadError {
  public readonly code = "upload/transport_failed";

  constructor(status?: number, cause?: unknown) {
    super(`Uploading the audio file failed${status ? ` (HTTP ${status})` : ""}.`, cause);
  }

  public override toUserMessage(): string {
    return "The upload was interrupted. Check your connection and try again.";
  }
}
