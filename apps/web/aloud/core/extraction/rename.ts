import { createFile, MP4BoxBuffer, type ISOFile, type Movie, type Track } from "mp4box";
import { Emitter } from "../events/Emitter";
import { DemuxError, NoAudioTrackError, UnsupportedFileError } from "../errors/ExtractionError";
import type { ExtractionError } from "../errors/ExtractionError";
import { ChunkedFileReader } from "./ChunkedFileReader";
import type { AudioTrackInfo, DemuxEvents, DemuxResult } from "./types";

const SUPPORTED_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"];

// Effectively "one segment" — we only care about the final, fully-flushed
// fragment, not incremental playback-sized chunks.
const SEGMENT_SAMPLE_COUNT = Number.MAX_SAFE_INTEGER;

/**
 * Pulls the audio track out of an MP4/MOV container without ever decoding
 * the video track.
 *
 * How it works: mp4box.js parses the container's box structure
 * progressively as bytes arrive (`ChunkedFileReader` feeds it 8 MB at a
 * time), finds the audio track, and re-packages *only that track's samples*
 * into a new, small fragmented MP4 (one init segment + media segments). The
 * video track's byte layout is parsed but its sample data is never decoded
 * or copied out — which is why a 1-hour, multi-gigabyte video finishes in
 * seconds and never spikes browser memory.
 *
 * mp4box.js reports failures through callbacks rather than exceptions, so
 * this class captures them into `capturedError` and surfaces that error at
 * the next checkpoint in `run()`, instead of throwing from inside a
 * library callback (which the library wouldn't catch).
 */
export class AudioTrackDemuxer extends Emitter<DemuxEvents> {
  private readonly file: File;
  private readonly isoFile: ISOFile;
  private readonly reader: ChunkedFileReader;

  private audioTrack: Track | null = null;
  private readonly segments: ArrayBuffer[] = [];
  private capturedError: ExtractionError | null = null;

  constructor(file: File) {
    super();
    this.file = file;
    this.reader = new ChunkedFileReader(file);
    // `false` here means "discard mdat data once it's been parsed" — the
    // memory-safety guarantee this whole class exists for.
    this.isoFile = createFile(false);
    this.bindCallbacks();
  }

  public async run(): Promise<DemuxResult> {
    this.assertSupportedType();

    await this.feedFileToParser();
    this.isoFile.flush();
    this.throwIfCaptured();

    if (!this.audioTrack) {
      throw new NoAudioTrackError();
    }

    this.emit("progress", {
      stage: "packaging",
      percent: 100,
      bytesProcessed: this.reader.bytesRead,
      totalBytes: this.reader.totalBytes,
    });

    const track = this.toAudioTrackInfo(this.audioTrack);
    const blob = new Blob(this.segments, { type: track.mimeType });

    return { track, blob, sourceSizeBytes: this.file.size };
  }

  private assertSupportedType(): void {
    if (this.file.type && !SUPPORTED_TYPES.includes(this.file.type)) {
      throw new UnsupportedFileError(this.file.type);
    }
  }

  private bindCallbacks(): void {
    this.isoFile.onReady = (info) => this.handleReady(info);
    this.isoFile.onError = (module, message) => {
      this.capturedError = new DemuxError(`${module}: ${message}`);
    };
    this.isoFile.onSegment = (id, _user, buffer) => {
      if (this.audioTrack && id === this.audioTrack.id) {
        this.segments.push(buffer);
      }
    };
  }

  private handleReady(info: Movie): void {
    const audioTrack = info.audioTracks[0];
    if (!audioTrack) {
      this.capturedError = new NoAudioTrackError();
      return;
    }
    this.audioTrack = audioTrack;

    // Ask mp4box.js to segment *only* this track. Because this is the only
    // track we've registered, the single init segment returned below
    // describes just the audio track — combined with every onSegment
    // buffer, that's a complete, playable, audio-only file.
    this.isoFile.setSegmentOptions(audioTrack.id, null, {
      nbSamples: SEGMENT_SAMPLE_COUNT,
      rapAlignement: false,
    });

    const { buffer: initSegment } = this.isoFile.initializeSegmentation();
    this.segments.push(initSegment);

    this.isoFile.start();
    this.emit("ready", { track: this.toAudioTrackInfo(audioTrack) });
  }

  private async feedFileToParser(): Promise<void> {
    let chunk = await this.reader.readNext();
    while (chunk) {
      const mp4boxBuffer = MP4BoxBuffer.fromArrayBuffer(chunk.arrayBuffer, chunk.fileStart);
      this.isoFile.appendBuffer(mp4boxBuffer);
      this.throwIfCaptured();

      this.emit("progress", {
        stage: this.audioTrack ? "demuxing" : "reading",
        percent: Math.round((this.reader.bytesRead / this.reader.totalBytes) * 100),
        bytesProcessed: this.reader.bytesRead,
        totalBytes: this.reader.totalBytes,
      });
      chunk = await this.reader.readNext();
    }
  }

  private throwIfCaptured(): void {
    if (this.capturedError) {
      const error = this.capturedError;
      this.capturedError = null;
      throw error;
    }
  }

  private toAudioTrackInfo(track: Track): AudioTrackInfo {
    return {
      trackId: track.id,
      codec: track.codec,
      sampleRate: track.audio?.sample_rate ?? 0,
      channelCount: track.audio?.channel_count ?? 0,
      duration: track.timescale > 0 ? track.duration / track.timescale : 0,
      mimeType: `audio/mp4; codecs="${track.codec}"`,
    };
  }
}
