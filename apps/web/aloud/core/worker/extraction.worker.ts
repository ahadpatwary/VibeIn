/// <reference lib="webworker" />

import { AudioTrackDemuxer, DemuxProgressEvent, DemuxResult } from "../extraction/AudioTrackDemuxer";
import { TopLevelBoxScanner } from "../extraction/TopLevelBoxScanner";
import { PipelineState } from "../pipeline/ExtractionPipeline";
import { WorkerOutboundMessage } from "../pipeline/types";

export type WorkerInboundMessage =
  | { kind: "start"; file: File; maxFileSizeBytes: number }
  | { kind: "abort" };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;
let currentController: AbortController | null = null;

function post(data: PipelineState, transfer: Transferable[] = []) {
    ctx.postMessage(data, transfer);
}

async function handleStart(file: File, maxFileSizeBytes: number) {

    if(file.size > maxFileSizeBytes) {
        // const err = new FileTooLargeError(file.size, maxFileSizeBytes);
        // post({ kind: "error", code: err.code, message: err.toUserMessage(), retryable: err.retryable });  //TODO: it have to fix leater.
        return;
    }

    currentController = new AbortController();
    const boxScanner = new TopLevelBoxScanner(file);
    const demuxer = new AudioTrackDemuxer(file, boxScanner);

    demuxer.on('progress', (data: DemuxProgressEvent) => post({
        stage: "extracting", 
        percent: data.percent,
        processedBytes: data.bytesProcessed,
        fileSizeBytes: data.totalBytes,
    }))


    try {
        console.log("start");
        const result: DemuxResult = await demuxer.run(currentController.signal);
        console.log("totoal result", result);
        post({
            stage: "extracted",
            blob: result.blob,
            fileSizeBytes: result.sourceSizeBytes,
            fileName: 'audio.tsx'
        })
        // Blob is structured-cloneable directly; no explicit transfer list needed.

    } catch (rawErr) {
        console.log('error', rawErr);
        // throw new Error(rawErr?.message);
        // const err = toAppError(rawErr);
        // post({ kind: "error", code: err.code, message: err.toUserMessage(), retryable: err.retryable });  //TODO: It have to fix leater
    } finally {
        currentController = null;
    }
}


ctx.addEventListener('message', (event: MessageEvent<WorkerInboundMessage>): any => {
    const msg: WorkerInboundMessage = event.data;
    console.log("event comming");

    if(msg.kind === "start") {
        console.log("ahad")
        handleStart(msg.file, msg.maxFileSizeBytes);
    }

    if(msg.kind === "abort") {
        if(currentController) {
            currentController.abort();
        }
    }
})