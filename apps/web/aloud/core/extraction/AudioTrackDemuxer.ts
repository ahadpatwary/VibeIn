import {
    BlobSource,
    EncodedAudioPacketSource,
    EncodedPacketSink,
    Input,
    Mp4OutputFormat,
    Output,
    BufferTarget,
    MP4,
} from "mediabunny";

import { TopLevelBoxScanner } from "./TopLevelBoxScanner";
import { DemuxError, NoAudioTrackError } from "../errors/ExtractionError";
import { TypedEventEmitter } from "../events/Emitter";


// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export interface DemuxResult {
    track: AudioTrackInfo;

    /**
     * Audio-only MP4/M4A output.
     *
     * NOTE:
     * The input file is NOT loaded into this Blob.
     * Only the extracted audio output is held in memory here.
     */
    blob: Blob;

    /**
     * Original input file size in bytes.
     */
    sourceSizeBytes: number;
}

export interface DemuxProgressEvent {
    /** 0–100 */
    percent: number;

    /**
     * Approximate amount of input media processed.
     *
     * This is based on the current audio packet timestamp because
     * Mediabunny uses random/lazy source reads rather than a simple
     * sequential byte cursor like the previous MP4Box implementation.
     */
    bytesProcessed: number;

    totalBytes: number;
}

export interface AudioTrackInfo {
    trackId: number;
    codec: string;
    sampleRate: number;
    channelCount: number;

    /** Track duration in seconds. */
    duration: number;

    /** MIME type of the packaged output. */
    mimeType: string;
}

export type DemuxEvents = {
    progress: DemuxProgressEvent;
};


// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const DEFAULT_MAX_SOURCE_CACHE_BYTES = 8 * 1024 * 1024;

/**
 * Number of encoded audio packets after which progress is emitted.
 *
 * This is deliberately not tied to a byte chunk size because Mediabunny
 * performs lazy/ranged reads internally.
 */
const PROGRESS_PACKET_INTERVAL = 100;


// -----------------------------------------------------------------------------
// AudioTrackDemuxer
// -----------------------------------------------------------------------------

export class AudioTrackDemuxer extends TypedEventEmitter<DemuxEvents> {
    constructor(
        private readonly file: File,
        /**
         * Kept in the constructor so the surrounding application does not
         * need to change immediately.
         *
         * Mediabunny does not need the old TopLevelBoxScanner for normal
         * demuxing because BlobSource/Input handles container discovery.
         */
        private readonly boxScanner?: TopLevelBoxScanner,
    ) {
        super();
    }


    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    async run(signal?: AbortSignal): Promise<DemuxResult> {
        this.#throwIfAborted(signal);

        if (!(this.file instanceof File)) {
            throw new DemuxError(
                "Audio extraction requires a browser File object.",
            );
        }

        if (this.file.size <= 0) {
            throw new DemuxError(
                "The input file is empty.",
            );
        }

        let input: Input | null = null;

        try {
            // -----------------------------------------------------------------
            // 1. Create a lazy/ranged source
            // -----------------------------------------------------------------
            //
            // IMPORTANT:
            //
            // We deliberately DO NOT do:
            //
            //     await file.arrayBuffer()
            //
            // because that would put the whole file in memory.
            //
            // BlobSource reads only the ranges requested by Mediabunny.
            //
            const source = new BlobSource(
                this.file,
                {
                    maxCacheSize: DEFAULT_MAX_SOURCE_CACHE_BYTES,

                    /**
                     * true is Mediabunny's default and is intended to
                     * efficiently read Blob/File data.
                     */
                    useStreamReader: true,
                },
            );

            input = new Input({
                formats: [MP4],
                // formats: [
                //     // We only need MP4/MOV-family input for this extractor.
                //     // Importing ALL_FORMATS would unnecessarily broaden the
                //     // parser surface for this specific class.
                //     "mp4" as never,
                // ],
                source,
            });

            this.#throwIfAborted(signal);

            // -----------------------------------------------------------------
            // 2. Verify that Mediabunny can read the file
            // -----------------------------------------------------------------

            const canRead = await input.canRead();

            this.#throwIfAborted(signal);

            if (!canRead) {
                throw new DemuxError(
                    "Mediabunny could not read this media file.",
                );
            }

            // -----------------------------------------------------------------
            // 3. Find the primary audio track
            // -----------------------------------------------------------------

            const audioTrack = await input.getPrimaryAudioTrack();

            this.#throwIfAborted(signal);

            if (!audioTrack) {
                throw new NoAudioTrackError();
            }

            // -----------------------------------------------------------------
            // 4. Read track metadata
            // -----------------------------------------------------------------

            const [
                codec,
                codecParameterString,
                sampleRate,
                channelCount,
                duration,
                decoderConfig,
            ] = await Promise.all([
                audioTrack.getCodec(),
                audioTrack.getCodecParameterString(),
                audioTrack.getSampleRate(),
                audioTrack.getNumberOfChannels(),
                audioTrack.getDurationFromMetadata(),
                audioTrack.getDecoderConfig(),
            ]);

            this.#throwIfAborted(signal);

            if (!codec) {
                throw new DemuxError(
                    `Mediabunny could not determine the codec for audio track ${audioTrack.id}.`,
                );
            }

            if (!Number.isFinite(sampleRate) || sampleRate <= 0) {
                throw new DemuxError(
                    `Invalid audio sample rate for track ${audioTrack.id}.`,
                );
            }

            if (!Number.isInteger(channelCount) || channelCount <= 0) {
                throw new DemuxError(
                    `Invalid audio channel count for track ${audioTrack.id}.`,
                );
            }

            // -----------------------------------------------------------------
            // 5. Create the output MP4
            // -----------------------------------------------------------------
            //
            // We copy encoded packets directly.
            //
            // There is NO audio decoding.
            // There is NO audio re-encoding.
            //
            // Therefore:
            //
            //     input AAC packets
            //             ↓
            //     EncodedAudioPacketSource
            //             ↓
            //          MP4 muxer
            //
            // This is much cheaper than decoding to PCM and encoding again.
            //

            const outputTarget = new BufferTarget();

            const output = new Output({
                format: new Mp4OutputFormat({
                    /**
                     * Fragmented MP4 keeps the output architecture friendly
                     * to incremental writing.
                     *
                     * However, because this class promises a final Blob,
                     * BufferTarget still stores the final audio-only output
                     * in memory.
                     */
                    fastStart: "fragmented",
                }),

                target: outputTarget,
            });

            const audioSource = new EncodedAudioPacketSource(codec);

            output.addAudioTrack(
                audioSource,
                decoderConfig
                    ? {
                          decoderConfig,
                      }
                    : undefined,
            );

            this.#throwIfAborted(signal);

            await output.start();

            this.#throwIfAborted(signal);

            // -----------------------------------------------------------------
            // 6. Create encoded packet reader
            // -----------------------------------------------------------------

            const packetSink = new EncodedPacketSink(audioTrack);

            // -----------------------------------------------------------------
            // 7. Stream packets from input -> output
            // -----------------------------------------------------------------
            //
            // `for await` is important here.
            //
            // We do NOT do:
            //
            //     const packets = [...]
            //
            // because that would accumulate the complete audio track.
            //
            // Instead:
            //
            //     packet
            //       ↓
            //     output
            //       ↓
            //     next packet
            //
            // Mediabunny also uses backpressure on media sources.
            //

            let packetCount = 0;
            let lastProgressPercent = -1;

            const totalDuration =
                duration !== null && Number.isFinite(duration) && duration > 0
                    ? duration
                    : null;

            for await (const packet of packetSink.packets()) {
                this.#throwIfAborted(signal);

                if (packet.byteLength <= 0) {
                    continue;
                }

                // -------------------------------------------------------------
                // First packet carries decoder configuration.
                // -------------------------------------------------------------

                if (packetCount === 0) {
                    await audioSource.add(
                        packet,
                        decoderConfig
                            ? {
                                  decoderConfig,
                              }
                            : undefined,
                    );
                } else {
                    await audioSource.add(packet);
                }

                packetCount++;

                // -------------------------------------------------------------
                // Progress
                // -------------------------------------------------------------
                //
                // Mediabunny is not consuming the input as a simple
                // 8-MiB sequential cursor.
                //
                // Therefore percentage is based on media timestamp rather
                // than "current byte offset".
                //

                if (
                    packetCount === 1 ||
                    packetCount % PROGRESS_PACKET_INTERVAL === 0
                ) {
                    const percent =
                        totalDuration !== null
                            ? Math.max(
                                  0,
                                  Math.min(
                                      99,
                                      Math.floor(
                                          ((packet.timestamp +
                                              packet.duration) /
                                              totalDuration) *
                                              100,
                                      ),
                                  ),
                              )
                            : 0;

                    if (percent !== lastProgressPercent) {
                        lastProgressPercent = percent;

                        this.emit("progress", {
                            bytesProcessed: Math.min(
                                this.file.size,
                                Math.floor(
                                    (percent / 100) * this.file.size,
                                ),
                            ),
                            percent,
                            totalBytes: this.file.size,
                        });
                    }
                }
            }

            this.#throwIfAborted(signal);

            if (packetCount === 0) {
                throw new DemuxError(
                    `No encoded audio packets were found in track ${audioTrack.id}.`,
                );
            }

            // -----------------------------------------------------------------
            // 8. Close the audio source
            // -----------------------------------------------------------------

            audioSource.close();

            // -----------------------------------------------------------------
            // 9. Finalize MP4
            // -----------------------------------------------------------------

            await output.finalize();

            this.#throwIfAborted(signal);

            const outputBuffer = outputTarget.buffer;

            if (!outputBuffer || outputBuffer.byteLength === 0) {
                throw new DemuxError(
                    "Mediabunny produced an empty audio output.",
                );
            }

            // -----------------------------------------------------------------
            // 10. Build public track metadata
            // -----------------------------------------------------------------

            const normalizedDuration =
                duration !== null &&
                Number.isFinite(duration) &&
                duration >= 0
                    ? duration
                    : 0;

            const track: AudioTrackInfo = {
                trackId: audioTrack.id,
                codec: codecParameterString ?? codec,
                sampleRate,
                channelCount,
                duration: normalizedDuration,
                mimeType: this.#buildMimeType(
                    codecParameterString ?? codec,
                ),
            };

            // 100% only after finalization succeeds.
            this.emit("progress", {
                bytesProcessed: this.file.size,
                percent: 100,
                totalBytes: this.file.size,
            });

            return {
                track,

                blob: new Blob(
                    [outputBuffer],
                    {
                        type: track.mimeType,
                    },
                ),

                sourceSizeBytes: this.file.size,
            };
        } catch (error) {
            if (error instanceof DemuxError) {
                throw error;
            }

            if (error instanceof DOMException && error.name === "AbortError") {
                throw new DemuxError(
                    "Audio demuxing was aborted.",
                    error,
                );
            }

            if (error instanceof Error) {
                throw new DemuxError(
                    "Unexpected error while extracting audio.",
                    error,
                );
            }

            throw new DemuxError(
                "Unexpected error while extracting audio.",
                error,
            );
        } finally {
            // -----------------------------------------------------------------
            // Always release Mediabunny resources.
            // -----------------------------------------------------------------

            try {
                input?.dispose();
            } catch (disposeError) {
                console.warn(
                    "Failed to dispose Mediabunny input.",
                    disposeError,
                );
            }
        }
    }


    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    #buildMimeType(codec: string): string {
        /**
         * AAC in MP4 normally looks like:
         *
         *     audio/mp4; codecs="mp4a.40.2"
         *
         * Some containers/codecs may expose a codec name that does not belong
         * in the MP4 codecs parameter. Keep the public result conservative.
         */

        if (codec.startsWith("mp4a.")) {
            return `audio/mp4; codecs="${codec}"`;
        }

        return "audio/mp4";
    }


    #throwIfAborted(signal?: AbortSignal): void {
        if (signal?.aborted) {
            throw new DemuxError(
                "Audio demuxing was aborted.",
            );
        }
    }
}