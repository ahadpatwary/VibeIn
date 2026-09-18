import { AppError } from "../errors/AppError";
import { TypedEventEmitter } from "../events/Emitter";
import { WorkerInboundMessage } from "../worker/extraction.worker";
import { WorkerOutboundMessage } from "./types";


export type PipelineState =
    | {
        stage: "idle";
    } | {
        stage: "validating";
    } | {
        stage: "extracting";
        percent: number;
        processedBytes: number;
        fileSizeBytes: number;
    } | {
        stage: "extracted";
        fileSizeBytes: number;
        fileName: string;
        blob: Blob;
    } | {
        stage: "uploading";
        percent: number;
    } | {
        stage: "uploaded";
        url: string;
    } | {
        stage: "error";
        messages: string[];
    } | {
        stage: "aborted";
    };


export type PipelineEvents = {
    state: PipelineState;
}

export class ExtractionPipeline extends TypedEventEmitter<PipelineEvents>  {
    private worker: Worker | null = null;
    private readonly maxFileSizeBytes: number; 
    private state: PipelineState = { stage: 'idle' };

    constructor(maxAllowdFileSizeBytes: number) {
        super();

        this.maxFileSizeBytes = maxAllowdFileSizeBytes;
    }

    async run(file: File): Promise<void> {

        // if(typeof Worker === 'undefined') {
        //     //TODO:
        //     throw new Error('Browser do not support web worker');
        // }

        // if(file.size > this.maxFileSizeBytes) {
        //     //TODO:
        //     throw new Error('File size is too long');
        // }

        //TODO: I have to validate here because no need to validate on worker becasue it's a low task

        await this.#runWorker(file);

    }

    abort(): void {
        this.worker?.postMessage({ kind: "abort" } satisfies WorkerInboundMessage);
        // this.uploadAbortController?.abort();
        // this.setState({ ...this.state, stage: "aborted" });
    }

    destroy(): void {
        this.worker?.terminate();
        // this.worker = null;
    }


    async #runWorker(file: File): Promise<void> {
        return new Promise((resolve, reject) => {

            const worker = new Worker(new URL("../worker/extraction.worker.ts", import.meta.url));
            this.worker = worker;

            this.worker.onerror = (ev) => {
                // reject(this.fail(new WorkerCrashedError(ev.message)));
                reject(ev)
            };
            this.worker.onmessage = (event: MessageEvent<PipelineState>): any => {
                const msg = event.data;

                switch(msg.stage) {
                    case 'extracting':
                        this.#setState({
                            stage: 'extracting',
                            percent: msg.percent,
                            processedBytes: msg.processedBytes,
                            fileSizeBytes: msg.fileSizeBytes,
                        })
                        break;
                    case 'extracted':
                        this.#setState({
                            stage: 'extracted',
                            blob: msg.blob,
                            fileName: 'voice.tsx',
                            fileSizeBytes: msg.fileSizeBytes,
                        })
                        resolve()
                        break;
                    case 'error':
                        //TODO: we have to update state
                        reject()
                        break;

                }
            }

            this.worker.postMessage({ 
                kind: "start",
                file,
                maxFileSizeBytes: this.maxFileSizeBytes 
            } satisfies WorkerInboundMessage)
        })
  
    }

    #setState(partial: PipelineState) {
        this.state = partial;
        this.emit("state", this.state);
    }
}

