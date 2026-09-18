"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ExtractionPipeline } from "@/core/pipeline/ExtractionPipeline";
import type { PipelineResult, PipelineState } from "@/core/pipeline/types";
import type { DemuxProgressEvent } from "@/core/extraction/types";
import type { UploadProgressEvent } from "@/core/upload/types";
import { AppError } from "@/core/errors/AppError";

export interface ExtractionState {
  stage: PipelineStage;
  demuxProgress: DemuxProgressEvent | null;
  uploadProgress: UploadProgressEvent | null;
  result: PipelineResult | null;
  error: AppError | null;
}

const INITIAL_STATE: ExtractionState = {
  stage: "idle",
  demuxProgress: null,
  uploadProgress: null,
  result: null,
  error: null,
};

/**
 * Bridges the framework-agnostic `ExtractionPipeline` class into React
 * state. This is intentionally the only place `ExtractionPipeline` and
 * React meet — the class itself has no idea React exists.
 */
export function useExtractionPipeline() {
  const [state, setState] = useState<ExtractionState>(INITIAL_STATE);
  const pipelineRef = useRef<ExtractionPipeline | null>(null);

  const getPipeline = useCallback((): ExtractionPipeline => {
    if (!pipelineRef.current) {
      const pipeline = new ExtractionPipeline();
      pipeline.on("stage", ({ stage }) => setState((prev) => ({ ...prev, stage })));
      pipeline.on("demux-progress", (demuxProgress) =>
        setState((prev) => ({ ...prev, demuxProgress })),
      );
      pipeline.on("upload-progress", (uploadProgress) =>
        setState((prev) => ({ ...prev, uploadProgress })),
      );
      pipeline.on("done", (result) => setState((prev) => ({ ...prev, result })));
      pipeline.on("error", ({ error }) => setState((prev) => ({ ...prev, error })));
      pipelineRef.current = pipeline;
    }
    return pipelineRef.current;
  }, []);

  const start = useCallback(
    (file: File) => {
      setState({ ...INITIAL_STATE, stage: "reading" });
      getPipeline()
        .run(file)
        .catch(() => {
          // Errors already land in state via the "error" event above;
          // this catch only exists so a rejected promise never surfaces
          // as an unhandled rejection.
        });
    },
    [getPipeline],
  );

  const reset = useCallback(() => {
    pipelineRef.current?.dispose();
    pipelineRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  return useMemo(() => ({ ...state, start, reset }), [state, start, reset]);
}
