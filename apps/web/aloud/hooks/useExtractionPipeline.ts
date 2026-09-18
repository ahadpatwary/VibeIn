'use client'

import { AppError } from "@/core/errors/AppError";
import { ExtractionPipeline, PipelineState } from "@/core/pipeline/ExtractionPipeline";
import { PipelineResult, PipelineStage } from "@/core/pipeline/types"
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { useCallback, useMemo, useRef, useState } from "react"


export function useExtractionPipeline() {
    const [state, setState] = useState<PipelineState>({ stage: 'idle'});
    const pipelineRef = useRef<ExtractionPipeline | null>(null);

    const getPipeline = useCallback((): ExtractionPipeline => {
        if(pipelineRef.current) return pipelineRef.current;

        const pipeline = new ExtractionPipeline(MAX_FILE_SIZE_BYTES); //TODO: we have to change 1000 leater
        
        pipeline.on('state', (data: PipelineState) => {
            // console.log("state...........", data);
            setState(() => data)
        })

        return pipelineRef.current = pipeline;
    }, [])

    const start = useCallback(async(file: File) => {
        // setState({ ...INITIAL_STATE, stage: "reading" });
        console.log("file", file);
        const pipeline = getPipeline();
        console.log("pipeline", pipeline);
        
        await pipeline.run(file);
            // .catch(() => {
            //     // Errors already land in state via the "error" event above;
            //     // this catch only exists so a rejected promise never surfaces
            //     // as an unhandled rejection.
            // });
        },
        [getPipeline],
    )

    const reset = useCallback(() => {
        pipelineRef.current?.destroy();
        pipelineRef.current = null;
        setState({ stage: 'idle'});
    }, []);

    return useMemo(() => ({ state, start, reset }), [state, start, reset]);

}