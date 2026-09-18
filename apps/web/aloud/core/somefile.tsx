// // import * as MP4Box from "mp4box";
// // import type { MP4ArrayBuffer, MP4MediaTrack } from "mp4box";
// // import { TopLevelBoxScanner } from "./TopLevelBoxScanner";
// // import { Emitter } from "../utils/Emitter";
// // import { EXTRACTION_CHUNK_SIZE, ACCEPTED_AUDIO_CODEC_PREFIXES } from "../config/constants";
// // import { AbortedError, DemuxError, NoAudioTrackError, toAppError } from "../errors/AppError";

// // export interface DemuxProgress {
// //   phase: "scanning" | "extracting" | "finalizing";
// //   processedBytes: number;
// //   totalBytes: number;
// // }

// // export interface DemuxResult {
// //   blob: Blob;
// //   mimeType: string;
// //   fileExtension: string;
// //   track: MP4MediaTrack;
// // }

// // interface DemuxerEvents {
// //   progress: DemuxProgress;
// //   trackFound: MP4MediaTrack;
// // }

// // function withFileStart(buffer: ArrayBuffer, fileStart: number): MP4ArrayBuffer {
// //   (buffer as MP4ArrayBuffer).fileStart = fileStart;
// //   return buffer as MP4ArrayBuffer;
// // }

// // function isAudioTrack(track: MP4MediaTrack): boolean {
// //   if (track.type === "audio") return true;
// //   return ACCEPTED_AUDIO_CODEC_PREFIXES.some((prefix) => track.codec?.startsWith(prefix));
// // }

// // /**
// //  * Pulls only the audio track out of a video file.
// //  *
// //  * Never decodes or touches video pixel data. moov is located via
// //  * {@link TopLevelBoxScanner} (works regardless of whether it sits at
// //  * the front or the end of the file), fed into mp4box.js out of
// //  * order, and then the file is streamed through in bounded windows so
// //  * mp4box.js can pull out the audio samples it needs. mp4box.js is
// //  * configured (via setSegmentOptions for ONLY the audio track id) to
// //  * discard everything else as it streams past it.
// //  */
// // export class AudioTrackDemuxer extends Emitter<DemuxerEvents> {
// //   constructor(private readonly file: File) {
// //     console.log("buffer", file.arrayBuffer, "file", file);
// //     super();
// //   }

// //   async run(signal?: AbortSignal): Promise<DemuxResult> {
// //     const scanner = new TopLevelBoxScanner(this.file);
// //     const scanResult = await scanner.scan();
// //     this.throwIfAborted(signal);

// //     // keepMdatData=false: once a sample has been handed to our
// //     // segment callback, mp4box.js is free to drop it from memory —
// //     // this is what keeps peak RAM bounded on multi-GB files.
// //     const mp4boxfile = MP4Box.createFile(false);
// //     const segments: ArrayBuffer[] = [];
// //     let resolvedTrack: MP4MediaTrack | null = null;
// //     let readyError: Error | null = null;

// //     mp4boxfile.onError = (error: string) => {
// //       readyError = new Error(error);
// //     };

// //     const readyPromise = new Promise<MP4MediaTrack>((resolve, reject) => {
// //       mp4boxfile.onReady = (info) => {
// //         const audioTrack = info.tracks.find(isAudioTrack);
// //         console.log("audioTrack", audioTrack);
// //         if (!audioTrack) {
// //           reject(new NoAudioTrackError());
// //           return;
// //         }
// //         mp4boxfile.setSegmentOptions(audioTrack.id, null, { nbSamples: 200 });
// //         const initSegments = mp4boxfile.initializeSegmentation();
// //         const init = initSegments.find((s) => s.id === audioTrack.id) ?? initSegments[0];
// //         if (init) segments.push(init.buffer);
// //         mp4boxfile.start();
// //         resolve(audioTrack);
// //       };
// //     });

// //     mp4boxfile.onSegment = (_id, _user, buffer) => {
// //       segments.push(buffer);
// //     };

// //     try {
// //       // Feed ftyp (if present) and moov, at their true file offsets, out of order.
// //       if (scanResult.ftyp) {
// //         mp4boxfile.appendBuffer(withFileStart(scanResult.ftyp.buffer, scanResult.ftyp.start));
// //       }
// //       console.log('result', scanResult);
// //       mp4boxfile.appendBuffer(withFileStart(scanResult.moov.buffer, scanResult.moov.start));

// //       resolvedTrack = await readyPromise;
// //       this.emit("trackFound", resolvedTrack);
// //     } catch (err) {
// //       throw toAppError(err);
// //     }

// //     if (readyError) throw new DemuxError("mp4box.js reported an error while parsing moov", readyError);

// //     // Phase 2: stream the rest of the file in bounded windows, skipping the
// //     // byte range we already delivered (moov, and ftyp if present).
// //     const skipRanges = [
// //       { start: scanResult.moov.start, end: scanResult.moov.start + scanResult.moov.buffer.byteLength },
// //       ...(scanResult.ftyp
// //         ? [{ start: scanResult.ftyp.start, end: scanResult.ftyp.start + scanResult.ftyp.buffer.byteLength }]
// //         : []),
// //     ];

// //     console.log("skipRange", skipRanges);

// //     const totalBytes = scanResult.fileSize;
// //     let offset = 0;

// //     while (offset < totalBytes) {
// //       this.throwIfAborted(signal);

// //       const skip = skipRanges.find((r) => offset >= r.start && offset < r.end);
// //       if (skip) {
// //         offset = skip.end;
// //         continue;
// //       }

// //       let windowEnd = Math.min(offset + EXTRACTION_CHUNK_SIZE, totalBytes);
// //       const nextSkip = skipRanges.find((r) => r.start > offset && r.start < windowEnd);
// //       if (nextSkip) windowEnd = nextSkip.start;
// //       if (windowEnd <= offset) break;

// //       const buffer = await this.file.slice(offset, windowEnd).arrayBuffer();
// //       try {
// //         mp4boxfile.appendBuffer(withFileStart(buffer, offset));
// //       } catch (err) {
// //         throw new DemuxError(`mp4box.js failed while appending bytes at offset ${offset}`, err);
// //       }
// //       if (readyError) throw new DemuxError("mp4box.js reported an error during extraction", readyError);

// //       offset = windowEnd;
// //       this.emit("progress", { phase: "extracting", processedBytes: offset, totalBytes });
// //     }

// //     mp4boxfile.flush();
// //     mp4boxfile.stop();
// //     this.emit("progress", { phase: "finalizing", processedBytes: totalBytes, totalBytes });

// //     if (!resolvedTrack) throw new NoAudioTrackError();
// //     if (segments.length === 0) {
// //       throw new DemuxError("No audio segments were produced — the file may be malformed.");
// //     }

// //     const mimeType = "audio/mp4";
// //     const blob = new Blob(segments, { type: mimeType });
// //     console.log("blob", blob);
// //     return { blob, mimeType, fileExtension: "m4a", track: resolvedTrack };
// //   }

// //   private throwIfAborted(signal?: AbortSignal) {
// //     if (signal?.aborted) throw new AbortedError();
// //   }
// // }



// import * as MP4Box from "mp4box";
// import type { MP4ArrayBuffer, MP4MediaTrack } from "mp4box";

// import { TopLevelBoxScanner } from "./TopLevelBoxScanner";
// import { Emitter } from "../utils/Emitter";
// import {
//   EXTRACTION_CHUNK_SIZE,
//   ACCEPTED_AUDIO_CODEC_PREFIXES,
// } from "../config/constants";
// import {
//   AbortedError,
//   DemuxError,
//   NoAudioTrackError,
//   toAppError,
// } from "../errors/AppError";

// export interface DemuxProgress {
//   phase: "scanning" | "extracting" | "finalizing";
//   processedBytes: number;
//   totalBytes: number;
// }

// export interface DemuxResult {
//   blob: Blob;
//   mimeType: string;
//   fileExtension: string;
//   track: MP4MediaTrack;
// }

// interface DemuxerEvents {
//   progress: DemuxProgress;
//   trackFound: MP4MediaTrack;
// }

// interface FileRange {
//   start: number;
//   end: number;
// }

// interface ScanResult {
//   fileSize: number;

//   ftyp?: {
//     start: number;
//     buffer: ArrayBuffer;
//   };

//   moov: {
//     start: number;
//     buffer: ArrayBuffer;
//   };
// }

// /**
//  * MP4Box expects an ArrayBuffer with a `fileStart` property.
//  *
//  * We deliberately do not copy the ArrayBuffer here.
//  */
// function withFileStart(
//   buffer: ArrayBuffer,
//   fileStart: number,
// ): MP4ArrayBuffer {
//   (buffer as MP4ArrayBuffer).fileStart = fileStart;
//   return buffer as MP4ArrayBuffer;
// }

// /**
//  * Determines whether a track is an audio track.
//  *
//  * `track.type === "audio"` is the primary check.
//  * Codec prefix detection is kept as a fallback because some files
//  * may expose incomplete/variant track metadata.
//  */
// function isAudioTrack(track: MP4MediaTrack): boolean {
//   if (track.type === "audio") {
//     return true;
//   }

//   return ACCEPTED_AUDIO_CODEC_PREFIXES.some((prefix) =>
//     track.codec?.startsWith(prefix),
//   );
// }

// /**
//  * Pulls the audio track out of an MP4/MOV file without decoding
//  * video pixels.
//  *
//  * Architecture:
//  *
//  *   File
//  *    │
//  *    ├── TopLevelBoxScanner
//  *    │      └── locate ftyp + moov
//  *    │
//  *    └── MP4Box
//  *           ├── parse container metadata
//  *           ├── identify audio track
//  *           ├── process media samples
//  *           └── emit fragmented MP4 audio segments
//  *
//  * Important:
//  *
//  * This class intentionally does NOT claim that locating `moov`
//  * means we can avoid reading the rest of the file. The current
//  * implementation still feeds media bytes to MP4Box in file-offset
//  * order.
//  *
//  * For very large production files, the next optimization should be
//  * replacing the in-memory `segments[]` array with a SegmentSink that
//  * streams each generated segment directly to S3 multipart upload.
//  */
// export class AudioTrackDemuxer extends Emitter<DemuxerEvents> {
//   constructor(private readonly file: File) {
//     console.log("File", file);
//     super();
//   }

//   async run(signal?: AbortSignal): Promise<DemuxResult> {
//     this.throwIfAborted(signal);

//     const scanResult = await this.scanFile(signal);
//     console.log("scanResult", scanResult);

//     this.throwIfAborted(signal);

//     this.emit("progress", {
//       phase: "scanning",
//       processedBytes: scanResult.moov.start + scanResult.moov.buffer.byteLength,
//       totalBytes: scanResult.fileSize,
//     });

//     /**
//      * keepMdatData = false
//      *
//      * We don't want MP4Box to unnecessarily retain parsed media data.
//      */
//     const mp4boxFile = MP4Box.createFile(false);
//     console.log("mp$boxFile created", mp4boxFile);

//     /**
//      * Current API returns a Blob, so segments have to stay alive
//      * until the Blob is created.
//      *
//      * IMPORTANT:
//      *
//      * This is NOT the final 20GB production architecture.
//      *
//      * For the final implementation:
//      *
//      *   onSegment()
//      *       ↓
//      *   SegmentSink.write()
//      *       ↓
//      *   S3 multipart upload
//      *       ↓
//      *   release segment
//      */
//     const segments: ArrayBuffer[] = [];

//     let resolvedTrack: MP4MediaTrack | null = null;
//     let parserError: Error | null = null;

//     /**
//      * These promises are used to wait until MP4Box has parsed
//      * the movie metadata and discovered the audio track.
//      */
//     let resolveReady!: (track: MP4MediaTrack) => void;
//     let rejectReady!: (error: unknown) => void;

//     const readyPromise = new Promise<MP4MediaTrack>(
//       (resolve, reject) => {
//         resolveReady = resolve;
//         rejectReady = reject;
//       },
//     );

//     console.log("readyPromise", readyPromise);

//     /**
//      * Prevent resolving/rejecting the ready promise multiple times.
//      */
//     let readySettled = false;
//     console.log("hi1");

//     /**
//      * MP4Box parser errors.
//      */
//     mp4boxFile.onError = (error: string) => {
//       console.log("error", error);
//       const normalizedError = new Error(
//         typeof error === "string"
//           ? error
//           : "Unknown MP4Box parsing error",
//       );

//       parserError = normalizedError;

//       if (!readySettled) {
//         readySettled = true;
//         rejectReady(normalizedError);
//       }
//     };
//     console.log("hi2")

//     /**
//      * MP4Box calls this after it has parsed the movie metadata.
//      */
//     mp4boxFile.onReady = (info) => {

//       console.log("🔥 MP4 READY");
//       console.log(
//           "tracks:",
//           info.tracks.map(t => ({
//               id: t.id,
//               type: t.type,
//               codec: t.codec,
//               duration: t.duration,
//               timescale: t.timescale,
//           }))
//       );
//       if (readySettled) {
//         console.log("readySettled", readySettled);
//         return;
//       }

//       console.log("ahad");

//       try {
//         console.log("audioTrack started");
//         const audioTrack = info.tracks.find(isAudioTrack);

//         console.log("audioTrack", audioTrack);

//         if (!audioTrack) {
//           const error = new NoAudioTrackError();

//           readySettled = true;
//           rejectReady(error);

//           return;
//         }

//         /**
//          * Only configure segmentation for the audio track.
//          *
//          * Video track is never configured for segmentation.
//          */
//         mp4boxFile.setSegmentOptions(
//           audioTrack.id,
//           null,
//           {
//             nbSamples: 200,
//             // rapAlignement: false,
//           },
//         );

//         /**
//          * Generate the fragmented MP4 initialization segment.
//          */
//         const initSegments =
//           mp4boxFile.initializeSegmentation();

//         const audioInitSegment =
//           initSegments.find(
//             (segment) => segment.id === audioTrack.id,
//           ) ?? initSegments[0];

//         if (!audioInitSegment) {
//           const error = new DemuxError(
//             "MP4Box did not produce an audio initialization segment.",
//           );

//           readySettled = true;
//           rejectReady(error);

//           return;
//         }

//         segments.push(audioInitSegment.buffer);

//         /**
//          * Start sample processing.
//          *
//          * At this point metadata is known and the audio track has
//          * segmentation configured.
//          */
//         mp4boxFile.start();

//         resolvedTrack = audioTrack;

//         readySettled = true;
//         resolveReady(audioTrack);
//       } catch (error) {
//         const appError = toAppError(error);

//         readySettled = true;
//         rejectReady(appError);
//       }
//     };

//     /**
//      * Every generated media segment is collected here.
//      *
//      * IMPORTANT:
//      * In the final S3 implementation, this callback should write
//      * directly to a SegmentSink instead of pushing into memory.
//      */
//     mp4boxFile.onSegment = (
//       _id,
//       _user,
//       buffer,
//     ) => {
//       console.log("🔥 SEGMENT", {
//           _id,
//           size: buffer.byteLength,
//           buffer: buffer
//       });

//       segments.push(buffer);
//     };

//     try {
//       /**
//        * ---------------------------------------------------------
//        * PHASE 1
//        * Feed metadata in a controlled way.
//        * ---------------------------------------------------------
//        *
//        * We feed ftyp and moov only for metadata discovery.
//        *
//        * However, we do NOT continue feeding arbitrary file ranges
//        * out of order after this point.
//        */
//       if (scanResult.ftyp) {
//         console.log("scanResult", scanResult);
//         this.appendBuffer(
//           mp4boxFile,
//           scanResult.ftyp.buffer,
//           scanResult.ftyp.start,
//           "ftyp",
//         );
//       }

//       this.appendBuffer(
//         mp4boxFile,
//         scanResult.moov.buffer,
//         scanResult.moov.start,
//         "moov",
//       );

//       console.log("call for resolve");

//       /**
//        * Wait until MP4Box has parsed the movie metadata.
//        */
//       resolvedTrack = await readyPromise;
//       console.log("resolved Tracked", resolvedTrack);

//       this.throwIfAborted(signal);

//       this.emit("trackFound", resolvedTrack);
//     } catch (error) {
//       throw toAppError(error);
//     }

//     if (parserError) {
//       throw new DemuxError(
//         "mp4box.js reported an error while parsing the file.",
//         parserError,
//       );
//     }

//     if (!resolvedTrack) {
//       throw new NoAudioTrackError();
//     }

//     /**
//      * ---------------------------------------------------------
//      * PHASE 2
//      * Feed the remaining file in file-offset order.
//      * ---------------------------------------------------------
//      *
//      * We skip the exact byte ranges already supplied:
//      *
//      *   ftyp
//      *   moov
//      *
//      * Everything else is fed to MP4Box using its real file offset.
//      */
//     const skipRanges = this.mergeRanges([
//       {
//         start: scanResult.moov.start,
//         end:
//           scanResult.moov.start +
//           scanResult.moov.buffer.byteLength,
//       },

//       ...(scanResult.ftyp
//         ? [
//             {
//               start: scanResult.ftyp.start,
//               end:
//                 scanResult.ftyp.start +
//                 scanResult.ftyp.buffer.byteLength,
//             },
//           ]
//         : []),
//     ]);

//     let offset = 0;
//     const totalBytes = scanResult.fileSize;

//     while (offset < totalBytes) {
//       this.throwIfAborted(signal);

//       /**
//        * If current offset lies inside an already-fed range,
//        * jump directly to the end of that range.
//        */
//       const currentSkip = skipRanges.find(
//         (range) =>
//           offset >= range.start &&
//           offset < range.end,
//       );

//       if (currentSkip) {
//         offset = currentSkip.end;
//         continue;
//       }

//       /**
//        * Normally read a bounded extraction window.
//        */
//       let windowEnd = Math.min(
//         offset + EXTRACTION_CHUNK_SIZE,
//         totalBytes,
//       );

//       /**
//        * Never allow one window to cross an already-fed range.
//        *
//        * Example:
//        *
//        *   current offset
//        *       │
//        *       ▼
//        *   ────────────────┬──────────────
//        *                   │
//        *                 moov
//        *
//        * We stop before moov and let the next iteration skip it.
//        */
//       const nextSkip = skipRanges.find(
//         (range) =>
//           range.start > offset &&
//           range.start < windowEnd,
//       );

//       if (nextSkip) {
//         windowEnd = nextSkip.start;
//       }

//       if (windowEnd <= offset) {
//         /**
//          * Defensive guard against an infinite loop.
//          */
//         throw new DemuxError(
//           `Extraction reader made no progress at offset ${offset}.`,
//         );
//       }

//       const buffer = await this.file
//         .slice(offset, windowEnd)
//         .arrayBuffer();

//       this.throwIfAborted(signal);

//       try {
//         mp4boxFile.appendBuffer(
//           withFileStart(buffer, offset),
//         );
//       } catch (error) {
//         throw new DemuxError(
//           `mp4box.js failed while appending bytes at offset ${offset}.`,
//           error,
//         );
//       }

//       if (parserError) {
//         throw new DemuxError(
//           "mp4box.js reported an error during extraction.",
//           parserError,
//         );
//       }

//       offset = windowEnd;

//       this.emit("progress", {
//         phase: "extracting",
//         processedBytes: offset,
//         totalBytes,
//       });
//     }

//     /**
//      * Tell MP4Box that no more input is coming.
//      *
//      * This allows it to flush remaining samples/segments.
//      */
//     try {
//       mp4boxFile.flush();
//     } catch (error) {
//       throw new DemuxError(
//         "mp4box.js failed while flushing the final samples.",
//         error,
//       );
//     } finally {
//       /**
//        * Always stop the parser, even if flush throws.
//        */
//       mp4boxFile.stop();
//     }

//     this.throwIfAborted(signal);

//     this.emit("progress", {
//       phase: "finalizing",
//       processedBytes: totalBytes,
//       totalBytes,
//     });

//     if (!resolvedTrack) {
//       throw new NoAudioTrackError();
//     }

//     if (segments.length === 0) {
//       throw new DemuxError(
//         "No audio segments were produced. The file may be malformed or the audio track may be unsupported.",
//       );
//     }

//     /**
//      * We intentionally use a generic fragmented MP4 MIME type.
//      *
//      * The returned file is an M4A-compatible fragmented MP4 container.
//      */
//     const mimeType = "audio/mp4";

//     const blob = new Blob(segments, {
//       type: mimeType,
//     });

//     console.log("blob", blob);

//     return {
//       blob,
//       mimeType,
//       fileExtension: "m4a",
//       track: resolvedTrack,
//     };
//   }

//   /**
//    * Runs the TopLevelBoxScanner and normalizes scanner errors.
//    */
//   private async scanFile(
//     signal?: AbortSignal,
//   ): Promise<ScanResult> {
//     this.emit("progress", {
//       phase: "scanning",
//       processedBytes: 0,
//       totalBytes: this.file.size,
//     });

//     this.throwIfAborted(signal);

//     try {
//       const scanner = new TopLevelBoxScanner(this.file);

//       const result = await scanner.scan();

//       this.throwIfAborted(signal);

//       if (!result?.moov) {
//         throw new DemuxError(
//           "Could not locate the moov box in the MP4/MOV file.",
//         );
//       }

//       if (result.moov.buffer.byteLength === 0) {
//         throw new DemuxError(
//           "The located moov box is empty.",
//         );
//       }

//       return result as ScanResult;
//     } catch (error) {
//       throw toAppError(error);
//     }
//   }

//   /**
//    * Append a buffer to MP4Box with the correct fileStart value.
//    */
//   private appendBuffer(
//     mp4boxFile: ReturnType<typeof MP4Box.createFile>,
//     buffer: ArrayBuffer,
//     fileStart: number,
//     label: string,
//   ): void {
//     try {
//       mp4boxFile.appendBuffer(
//         withFileStart(buffer, fileStart),
//       );
//       console.log("mp4BoxFIle", mp4boxFile);
//     } catch (error) {
//       throw new DemuxError(
//         `mp4box.js failed while appending ${label} at file offset ${fileStart}.`,
//         error,
//       );
//     }
//   }

//   /**
//    * Merges overlapping/adjacent ranges.
//    *
//    * Example:
//    *
//    *   [0, 100]
//    *   [100, 200]
//    *
//    * becomes:
//    *
//    *   [0, 200]
//    *
//    * This makes the extraction loop simpler and prevents
//    * unnecessary iterations.
//    */
//   private mergeRanges(
//     ranges: FileRange[],
//   ): FileRange[] {
//     if (ranges.length === 0) {
//       return [];
//     }

//     const sorted = [...ranges]
//       .filter(
//         (range) =>
//           range.end > range.start &&
//           range.start >= 0,
//       )
//       .sort(
//         (a, b) => a.start - b.start,
//       );

//     const merged: FileRange[] = [];

//     for (const range of sorted) {
//       const previous =
//         merged[merged.length - 1];

//       if (!previous) {
//         merged.push({ ...range });
//         continue;
//       }

//       if (range.start <= previous.end) {
//         previous.end = Math.max(
//           previous.end,
//           range.end,
//         );
//       } else {
//         merged.push({ ...range });
//       }
//     }

//     return merged;
//   }

//   /**
//    * Abort helper.
//    */
//   private throwIfAborted(
//     signal?: AbortSignal,
//   ): void {
//     if (signal?.aborted) {
//       throw new AbortedError();
//     }
//   }
// }





import * as MP4Box from "mp4box";
import type {
  MP4ArrayBuffer,
  MP4MediaTrack,
} from "mp4box";

import { TopLevelBoxScanner } from "./TopLevelBoxScanner";
import { Emitter } from "../utils/Emitter";

import {
  EXTRACTION_CHUNK_SIZE,
  ACCEPTED_AUDIO_CODEC_PREFIXES,
} from "../config/constants";

import {
  AbortedError,
  DemuxError,
  NoAudioTrackError,
  toAppError,
} from "../errors/AppError";

export interface DemuxProgress {
  phase:
    | "scanning"
    | "parsing"
    | "extracting"
    | "finalizing";

  processedBytes: number;
  totalBytes: number;
}

export interface DemuxResult {
  blob: Blob;
  mimeType: string;
  fileExtension: string;
  track: MP4MediaTrack;
}

interface DemuxerEvents {
  progress: DemuxProgress;
  trackFound: MP4MediaTrack;
}

interface FileRange {
  start: number;
  end: number;
}

interface ScanResult {
  ftyp?: {
    buffer: ArrayBuffer;
    start: number;
  };

  moov: {
    buffer: ArrayBuffer;
    start: number;
  };

  boxesSeen: Array<{
    type: string;
    start: number;
    size: number;
    payloadStart: number;
    headerSize: number;
  }>;

  fileSize: number;
}

function withFileStart(
  buffer: ArrayBuffer,
  fileStart: number,
): MP4ArrayBuffer {
  const mp4Buffer = buffer as MP4ArrayBuffer;

  mp4Buffer.fileStart = fileStart;

  return mp4Buffer;
}

function isAudioTrack(
  track: MP4MediaTrack,
): boolean {
  if (track.type === "audio") {
    return true;
  }

  return ACCEPTED_AUDIO_CODEC_PREFIXES.some(
    (prefix) => track.codec?.startsWith(prefix),
  );
}

export class AudioTrackDemuxer extends Emitter<DemuxerEvents> {
  constructor(
    private readonly file: File,
  ) {
    super();

    console.log("🎬 File", {
      name: file.name,
      size: file.size,
      type: file.type,
    });
  }

  async run(
    signal?: AbortSignal,
  ): Promise<DemuxResult> {
    this.throwIfAborted(signal);

    /*
     * ============================================================
     * PHASE 1
     * ============================================================
     *
     * Scanner is used ONLY for inspection/progress.
     *
     * IMPORTANT:
     *
     * We DO NOT inject the discovered moov into MP4Box.
     *
     * MP4Box must receive the actual file in physical order:
     *
     *   ftyp
     *   free
     *   mdat
     *   ...
     *   moov
     *
     * This avoids creating a gap inside MP4Box's internal
     * MultiBufferStream.
     */

    const scanResult = await this.scanFile(signal);

    console.log("🔎 scanResult", scanResult);

    this.throwIfAborted(signal);

    this.emit("progress", {
      phase: "scanning",
      processedBytes: 0,
      totalBytes: scanResult.fileSize,
    });

    /*
     * ============================================================
     * PHASE 2
     * Create MP4Box
     * ============================================================
     *
     * IMPORTANT:
     *
     * We intentionally use createFile(true).
     *
     * Why?
     *
     * Your problematic files have:
     *
     *   ftyp
     *   free
     *   mdat
     *   moov
     *
     * with moov at the END.
     *
     * If discardMdatData=true is used while MP4Box has not yet
     * parsed moov, media data can be discarded before MP4Box knows
     * how to map it to samples.
     *
     * createFile(true) keeps mdat data available.
     *
     * This is correctness-first.
     *
     * WARNING:
     *
     * For huge 8GB/20GB mobile files, this can create significant
     * memory pressure.
     *
     * A true low-memory 20GB implementation should use a
     * random-access sample-range architecture instead.
     */

    const mp4boxFile = MP4Box.createFile(false); //true dile success chilo

    console.log("🧩 MP4Box created", mp4boxFile);

    /*
     * ============================================================
     * State
     * ============================================================
     */

    const segments: ArrayBuffer[] = [];

    let resolvedTrack: MP4MediaTrack | null = null;

    let parserError: Error | null = null;

    let readySettled = false;

    let resolveReady!: (
      track: MP4MediaTrack,
    ) => void;

    let rejectReady!: (
      error: unknown,
    ) => void;

    const readyPromise =
      new Promise<MP4MediaTrack>(
        (resolve, reject) => {
          resolveReady = resolve;
          rejectReady = reject;
        },
      );

    /*
     * ============================================================
     * MP4Box ERROR
     * ============================================================
     */

    mp4boxFile.onError = (
      error: string,
    ) => {
      console.error(
        "❌ MP4Box ERROR",
        error,
      );

      const normalizedError =
        new Error(
          typeof error === "string"
            ? error
            : "Unknown MP4Box parsing error",
        );

      parserError =
        normalizedError;

      if (!readySettled) {
        readySettled = true;

        rejectReady(
          normalizedError,
        );
      }
    };

    /*
     * ============================================================
     * MP4Box MOOV START
     * ============================================================
     */

    mp4boxFile.onMoovStart = () => {
      console.log(
        "🚀 MP4Box started parsing moov",
      );

      this.emit("progress", {
        phase: "parsing",
        processedBytes:
          scanResult.moov.start,
        totalBytes:
          scanResult.fileSize,
      });
    };

    /*
     * ============================================================
     * MP4Box READY
     * ============================================================
     *
     * This fires after moov has been parsed.
     */

    mp4boxFile.onReady = (
      info,
    ) => {
      console.log(
        "🔥 MP4 READY",
      );

      console.log(
        "🎵 Tracks:",
        info.tracks.map(
          (track) => ({
            id: track.id,
            type: track.type,
            codec: track.codec,
            duration: track.duration,
            timescale: track.timescale,
          }),
        ),
      );

      if (readySettled) {
        return;
      }

      try {
        /*
         * Find audio track.
         */

        const audioTrack =
          info.tracks.find(
            isAudioTrack,
          );

        console.log(
          "🎧 Audio track",
          audioTrack,
        );

        if (!audioTrack) {
          const error =
            new NoAudioTrackError();

          readySettled = true;

          rejectReady(error);

          return;
        }

        /*
         * Configure segmentation ONLY
         * for the audio track.
         */

        mp4boxFile.setSegmentOptions(
          audioTrack.id,
          null,
          {
            nbSamples: 200,

            /*
             * Audio does not need RAP alignment
             * in the same way video does.
             *
             * We intentionally leave it disabled.
             */
            rapAlignement: false,
          },
        );

        /*
         * Create fragmented MP4
         * initialization segment.
         */

        const initSegments =
          mp4boxFile.initializeSegmentation();

        console.log(
          "📦 initSegments",
          initSegments,
        );

        const audioInitSegment =
          initSegments.find(
            (segment) =>
              segment.id ===
              audioTrack.id,
          );

        if (!audioInitSegment) {
          const error =
            new DemuxError(
              "MP4Box did not produce an audio initialization segment.",
            );

          readySettled = true;

          rejectReady(error);

          return;
        }

        /*
         * Store initialization segment.
         */

        segments.push(
          audioInitSegment.buffer,
        );

        resolvedTrack =
          audioTrack;

        /*
         * Start sample processing.
         *
         * IMPORTANT:
         *
         * According to MP4Box's API,
         * samples already received can be
         * processed after start(), and new
         * appendBuffer() calls trigger processing.
         */

        console.log(
          "▶️ Starting MP4Box sample processing",
        );

        mp4boxFile.start();

        readySettled = true;

        resolveReady(
          audioTrack,
        );
      } catch (error) {
        const appError =
          toAppError(error);

        readySettled = true;

        rejectReady(appError);
      }
    };

    /*
     * ============================================================
     * MP4Box SEGMENTS
     * ============================================================
     */

    mp4boxFile.onSegment = (
      id,
      _user,
      buffer,
      sampleNumber,
      last,
    ) => {
      /*
       * Ignore anything that is not our
       * selected audio track.
       */

      if (
        resolvedTrack &&
        id !== resolvedTrack.id
      ) {
        return;
      }

      console.log(
        "🔥 AUDIO SEGMENT",
        {
          trackId: id,
          size: buffer.byteLength,
          sampleNumber,
          last,
        },
      );

      segments.push(buffer);

      /*
       * releaseUsedSamples is intentionally
       * not used here yet because the current
       * result is kept as Blob segments.
       *
       * In the final S3 implementation:
       *
       *   onSegment
       *      ↓
       *   SegmentSink
       *      ↓
       *   S3 multipart
       *      ↓
       *   releaseUsedSamples
       */
    };

    try {
      /*
       * ==========================================================
       * PHASE 3
       * Sequential file feeding
       * ==========================================================
       *
       * NO:
       *
       *   ftyp -> moov -> offset 0
       *
       * YES:
       *
       *   offset 0
       *       ↓
       *   chunk
       *       ↓
       *   MP4Box
       *       ↓
       *   next chunk
       *       ↓
       *   ...
       *       ↓
       *   moov
       *
       * This preserves the actual file order.
       */

      let offset = 0;

      const totalBytes =
        this.file.size;

      while (
        offset < totalBytes
      ) {
        this.throwIfAborted(
          signal,
        );

        const windowEnd =
          Math.min(
            offset +
              EXTRACTION_CHUNK_SIZE,
            totalBytes,
          );

        const chunkSize =
          windowEnd - offset;

        console.log(
          "📥 APPEND",
          {
            start: offset,
            end: windowEnd,
            size: chunkSize,
            progress:
              `${(
                (offset /
                  totalBytes) *
                100
              ).toFixed(2)}%`,
          },
        );

        const buffer =
          await this.file
            .slice(
              offset,
              windowEnd,
            )
            .arrayBuffer();

        this.throwIfAborted(
          signal,
        );

        /*
         * MP4Box requires fileStart.
         */

        const mp4Buffer =
          withFileStart(
            buffer,
            offset,
          );

        try {
          const nextOffset =
            mp4boxFile.appendBuffer(
              mp4Buffer,
            );

          console.log(
            "➡️ MP4Box next expected offset",
            {
              suppliedOffset:
                offset,

              suppliedEnd:
                windowEnd,

              nextOffset,
            },
          );
        } catch (error) {
          throw new DemuxError(
            `MP4Box failed while appending bytes at offset ${offset}.`,
            error,
          );
        }

        if (parserError) {
          throw new DemuxError(
            "MP4Box reported an error during extraction.",
            parserError,
          );
        }

        offset = windowEnd;

        /*
         * If moov has already been parsed,
         * extraction has started.
         */

        this.emit(
          "progress",
          {
            phase:
              resolvedTrack
                ? "extracting"
                : "parsing",

            processedBytes:
              offset,

            totalBytes,
          },
        );

        /*
         * Yield back to browser.
         *
         * This is especially useful on mobile.
         *
         * It gives the browser a chance to:
         *
         * - render UI
         * - process user events
         * - perform GC
         * - run other tasks
         */

        await this.yieldToBrowser(
          signal,
        );
      }

      /*
       * ==========================================================
       * PHASE 4
       * Ensure MP4 metadata was parsed.
       * ==========================================================
       */

      if (!resolvedTrack) {
        /*
         * Normally onReady should have fired
         * before the end of the file.
         */

        await readyPromise;
      }

      this.throwIfAborted(
        signal,
      );

      /*
       * ==========================================================
       * PHASE 5
       * Flush
       * ==========================================================
       */

      console.log(
        "🧹 Flushing MP4Box",
      );

      try {
        mp4boxFile.flush();
      } catch (error) {
        throw new DemuxError(
          "MP4Box failed while flushing final samples.",
          error,
        );
      }

      /*
       * Give pending segment callbacks
       * a chance to execute.
       */

      await this.yieldToBrowser(
        signal,
      );
    } catch (error) {
      throw toAppError(error);
    } finally {
      /*
       * Always stop MP4Box.
       */

      try {
        mp4boxFile.stop();
      } catch (error) {
        console.warn(
          "⚠️ MP4Box stop failed",
          error,
        );
      }
    }

    /*
     * ============================================================
     * Final validation
     * ============================================================
     */

    if (parserError) {
      throw new DemuxError(
        "MP4Box reported an error while processing the file.",
        parserError,
      );
    }

    if (!resolvedTrack) {
      throw new NoAudioTrackError();
    }

    if (segments.length === 0) {
      throw new DemuxError(
        "No audio segments were produced. The file may be malformed or the audio track may be unsupported.",
      );
    }

    /*
     * ============================================================
     * Create final Blob
     * ============================================================
     *
     * IMPORTANT:
     *
     * This is okay for testing/smaller files.
     *
     * DO NOT use this final Blob architecture for
     * 20GB production uploads.
     *
     * Replace segments[] with SegmentSink + S3
     * multipart upload later.
     */

    const mimeType =
      "audio/mp4";

    const blob =
      new Blob(
        segments,
        {
          type: mimeType,
        },
      );

    console.log(
      "🎉 Final audio Blob",
      {
        size:
          blob.size,

        type:
          blob.type,

        segments:
          segments.length,
      },
    );

    this.emit(
      "progress",
      {
        phase:
          "finalizing",

        processedBytes:
          totalBytes,

        totalBytes,
      },
    );

    return {
      blob,

      mimeType,

      fileExtension:
        "m4a",

      track:
        resolvedTrack,
    };
  }

  /*
   * ============================================================
   * Scanner
   * ============================================================
   *
   * Scanner is retained for:
   *
   * - validating the file
   * - discovering moov
   * - progress information
   * - future random-access implementation
   *
   * BUT:
   *
   * Its moov buffer is NOT injected into MP4Box.
   */

  private async scanFile(
    signal?: AbortSignal,
  ): Promise<ScanResult> {
    this.throwIfAborted(
      signal,
    );

    try {
      const scanner =
        new TopLevelBoxScanner(
          this.file,
        );

      const result =
        await scanner.scan();

      this.throwIfAborted(
        signal,
      );

      if (!result?.moov) {
        throw new DemuxError(
          "Could not locate the moov box in the MP4/MOV file.",
        );
      }

      if (
        result.moov.buffer
          .byteLength === 0
      ) {
        throw new DemuxError(
          "The located moov box is empty.",
        );
      }

      console.log(
        "🔎 Scanner result",
        {
          fileSize:
            result.fileSize,

          ftyp:
            result.ftyp
              ? {
                  start:
                    result.ftyp.start,

                  size:
                    result.ftyp.buffer
                      .byteLength,
                }
              : null,

          moov: {
            start:
              result.moov.start,

            size:
              result.moov.buffer
                .byteLength,
          },

          boxesSeen:
            result.boxesSeen,
        },
      );

      return result as ScanResult;
    } catch (error) {
      throw toAppError(error);
    }
  }

  /*
   * ============================================================
   * Browser yielding
   * ============================================================
   */

  private async yieldToBrowser(
    signal?: AbortSignal,
  ): Promise<void> {
    this.throwIfAborted(
      signal,
    );

    await new Promise<void>(
      (resolve) => {
        setTimeout(
          resolve,
          0,
        );
      },
    );

    this.throwIfAborted(
      signal,
    );
  }

  /*
   * ============================================================
   * Abort
   * ============================================================
   */

  private throwIfAborted(
    signal?: AbortSignal,
  ): void {
    if (signal?.aborted) {
      throw new AbortedError();
    }
  }
}
