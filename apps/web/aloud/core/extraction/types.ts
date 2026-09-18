export interface AudioTrackInfo {
  trackId: number;
  codec: string;
  sampleRate: number;
  channelCount: number;
  /** Track duration in seconds. */
  duration: number;
  /** MIME type of the packaged output, e.g. "audio/mp4". */
  mimeType: string;
}

export interface DemuxResult {
  track: AudioTrackInfo;
  /** The demuxed, re-packaged audio-only file, ready to play or upload. */
  blob: Blob;
  /** Size of the original video file, in bytes — used to show the size reduction. */
  sourceSizeBytes: number;
}

export type DemuxStage = "reading" | "demuxing" | "packaging";

export interface DemuxProgressEvent {
  /** 0–100 */
  percent: number;
  bytesProcessed: number;
  totalBytes: number;
}

export interface DemuxEvents extends Record<string, unknown> {
  progress: DemuxProgressEvent;
  ready: { track: AudioTrackInfo };
  [key: string]: unknown;
}
