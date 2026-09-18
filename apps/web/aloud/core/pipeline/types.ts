import type { AppError } from "../errors/AppError";
import { DemuxResult } from "../extraction/AudioTrackDemuxer";
import type { AudioTrackInfo, DemuxProgressEvent } from "../extraction/types";
import type { UploadProgressEvent } from "../upload/types";

export type PipelineStage = 
    | "idle"
    | "validating"
    | 'extracting'
    | 'uploading'
    | 'error'
    | 'aborted'
    | 'done'
;

export interface PipelineResult {
  track?: AudioTrackInfo;
  blob: Blob;
  fileName: string;
  sourceSizeBytes: number;
  fileKey: string;
}

// export interface PipelineEvents extends Record<string, unknown> {
//   stage: { stage: PipelineStage };
//   "demux-progress": DemuxProgressEvent;
//   "upload-progress": UploadProgressEvent;
//   done: PipelineResult;
//   error: { error: AppError };
//   [key: string]: unknown;
// }
    // percent: number;
    // bytesProcessed: number;
    // totalBytes: number;

export type WorkerOutboundMessage =
  | ({ 
      kind: "progress";
    } & DemuxProgressEvent)
  | ({
      kind: "done";
    } & DemuxResult )
  | { 
      kind: "error";
      // code: ErrorCode;
      message: string; 
      retryable: boolean 
    }
;