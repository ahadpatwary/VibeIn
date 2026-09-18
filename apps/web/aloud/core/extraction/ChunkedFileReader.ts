import { FileReadError } from "../errors/ExtractionError";

export interface FileChunk {
  arrayBuffer: ArrayBuffer;
  /** Byte offset of this chunk within the original file. */
  fileStart: number;
}

/**
 * Reads a `File` in fixed-size slices instead of loading it whole.
 *
 * This is the piece that keeps memory flat regardless of source file size:
 * a 20 GB video is read 8 MB at a time, and each chunk is handed off and
 * discarded before the next one is read. Deliberately has no knowledge of
 * mp4box.js — `AudioTrackDemuxer` adapts these chunks to whatever the
 * demuxing library expects.
 */
export class ChunkedFileReader {
  public static readonly DEFAULT_CHUNK_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

  private readonly file: File;
  private readonly chunkSizeBytes: number;
  private offset = 0;

  constructor(file: File, chunkSizeBytes: number = ChunkedFileReader.DEFAULT_CHUNK_SIZE_BYTES) {
    this.file = file;
    this.chunkSizeBytes = chunkSizeBytes;
  }

  public get totalBytes(): number {
    return this.file.size;
  }

  public get bytesRead(): number {
    return this.offset;
  }

  public get isDone(): boolean {
    return this.offset >= this.file.size;
  }

  /** Reads and returns the next chunk, or `null` once the file is exhausted. */
  public async readNext(): Promise<FileChunk | null> {
    if (this.isDone) return null;

    const start = this.offset;
    const end = Math.min(start + this.chunkSizeBytes, this.file.size);

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await this.file.slice(start, end).arrayBuffer();
    } catch (cause) {
      throw new FileReadError(cause);
    }

    this.offset = end;
    return { arrayBuffer, fileStart: start };
  }
}
