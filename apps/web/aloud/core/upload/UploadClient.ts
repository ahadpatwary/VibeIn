import { Emitter } from "../events/Emitter";
import { PresignRequestError, UploadTransportError } from "../errors/UploadError";
import type { PresignRequest, PresignResponse, UploadEvents, UploadResult } from "./types";

/**
 * Contract the pipeline depends on. `HttpUploadClient` below is the default
 * implementation; swap in a different one (e.g. one that talks to a
 * different backend route, or a mock for local UI work) without touching
 * `ExtractionPipeline`.
 */
export abstract class UploadClient extends Emitter<UploadEvents> {
  public abstract upload(blob: Blob, fileName: string): Promise<UploadResult>;
}

/**
 * ============================================================================
 *  BACKEND INTEGRATION POINT
 * ============================================================================
 *  This is the only class in the app that talks to the backend. It assumes:
 *
 *    1. POST `presignEndpoint` with a `PresignRequest` JSON body returns a
 *       `PresignResponse` — a presigned URL the browser can PUT the audio
 *       file to directly (S3 / GCS / R2 / Cloudinary signed upload / etc.),
 *       plus a `fileKey` your backend can use afterwards to kick off
 *       transcription.
 *    2. The browser then PUTs the raw audio bytes to `uploadUrl`.
 *
 *  Nothing else in this codebase assumes a specific storage provider —
 *  change the two request shapes in `core/upload/types.ts` and this class
 *  to match whatever your backend actually returns.
 * ============================================================================
 */
export class HttpUploadClient extends UploadClient {
  private readonly presignEndpoint: string;

  constructor(presignEndpoint = "/api/uploads/presign") {
    super();
    this.presignEndpoint = presignEndpoint;
  }

  public async upload(blob: Blob, fileName: string): Promise<UploadResult> {
    // const presigned = await this.requestPresignedUrl({
    //   fileName,
    //   contentType: blob.type || "audio/mp4",
    //   sizeBytes: blob.size,
    // });

    // await this.putToPresignedUrl(presigned, blob);

    console.log('blob', blob);
    const presigned = {
      fileKey: "file1"
    }

    return { fileKey: presigned.fileKey };
  }

  private async requestPresignedUrl(request: PresignRequest): Promise<PresignResponse> {
    let response: Response;
    try {
      response = await fetch(this.presignEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    } catch (cause) {
      throw new PresignRequestError(undefined, cause);
    }

    if (!response.ok) {
      throw new PresignRequestError(response.status);
    }

    return (await response.json()) as PresignResponse;
  }

  /**
   * Uses XMLHttpRequest instead of fetch purely for `upload.onprogress` —
   * fetch still has no cross-browser way to report upload progress.
   */
  private putToPresignedUrl(presigned: PresignResponse, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presigned.uploadUrl, true);

      Object.entries(presigned.headers ?? {}).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
      if (!presigned.headers?.["Content-Type"]) {
        xhr.setRequestHeader("Content-Type", blob.type || "audio/mp4");
      }

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        this.emit("progress", {
          percent: Math.round((event.loaded / event.total) * 100),
          bytesSent: event.loaded,
          totalBytes: event.total,
        });
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new UploadTransportError(xhr.status));
        }
      };
      xhr.onerror = () => reject(new UploadTransportError(xhr.status));

      xhr.send(blob);
    });
  }
}
