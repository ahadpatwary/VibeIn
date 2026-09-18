export interface PresignRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface PresignResponse {
  /** URL the browser PUTs the file to directly (S3/GCS/R2 presigned URL, etc). */
  uploadUrl: string;
  /** Backend-issued key/id the client can reference later (e.g. to poll transcription status). */
  fileKey: string;
  /** Extra headers the storage provider requires on the PUT, if any. */
  headers?: Record<string, string>;
}

export interface UploadProgressEvent {
  /** 0–100 */
  percent: number;
  bytesSent: number;
  totalBytes: number;
}

export interface UploadResult {
  fileKey: string;
}

export interface UploadEvents extends Record<string, unknown> {
  progress: UploadProgressEvent;
  [key: string]: unknown;
}
