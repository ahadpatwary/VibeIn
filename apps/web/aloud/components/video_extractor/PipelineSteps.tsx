// "use client";

// import { PIPELINE_STEP_ORDER } from "@/lib/constants";
// import { formatBytes, formatCodec } from "@/lib/format";
// // import type { PipelineStage } from "@/core/pipeline/types";
// import type { DemuxProgressEvent } from "@/core/extraction/types";
// import type { UploadProgressEvent } from "@/core/upload/types";
// import { PipelineState } from "@/core/pipeline/ExtractionPipeline";
// import { PipelineStage } from "@/core/pipeline/types";

// interface PipelineStepsProps {
//   state: PipelineState;
//   audioCodec?: string;
// }

// const STEP_LABEL: Record<(typeof PIPELINE_STEP_ORDER)[number], string> = {
//   reading: "Reading source file",
//   demuxing: "Demuxing audio track",
//   packaging: "Packaging audio-only file",
//   uploading: "Uploading",
// };

// function stepStatus(
//   step: (typeof PIPELINE_STEP_ORDER)[number],
//   currentStage: PipelineStage,
// ): "pending" | "active" | "done" {
//   const order = PIPELINE_STEP_ORDER;
//   if (currentStage === "idle") return "pending";
//   if (currentStage === "error") return order.indexOf(step) < order.length ? "pending" : "pending";
//   if (currentStage === "done") return "done";

//   const currentIndex = order.indexOf(currentStage as (typeof order)[number]);
//   const stepIndex = order.indexOf(step);
//   if (stepIndex < currentIndex) return "done";
//   if (stepIndex === currentIndex) return "active";
//   return "pending";
// }

// function stepDetail(
//   step: (typeof PIPELINE_STEP_ORDER)[number],
//   status: "pending" | "active" | "done",
//   demuxProgress: DemuxProgressEvent | null,
//   uploadProgress: UploadProgressEvent | null,
//   audioCodec: string | undefined,
// ): string | null {
//   if (status === "pending") return null;

//   if (step === "reading" || step === "demuxing") {
//     if (!demuxProgress) return null;
//     return `${formatBytes(demuxProgress.bytesProcessed)} / ${formatBytes(demuxProgress.totalBytes)}`;
//   }
//   if (step === "packaging") {
//     return audioCodec ? `audio track (${formatCodec(audioCodec)})` : null;
//   }
//   if (step === "uploading") {
//     if (!uploadProgress) return status === "active" ? "starting…" : null;
//     return `${uploadProgress.percent}%`;
//   }
//   return null;
// }

// export function PipelineSteps({ state, audioCodec }: PipelineStepsProps) {
//   if (state.stage === "idle") return null;

//   return (
//     <ol className="flex flex-col gap-2.5">
//       {PIPELINE_STEP_ORDER.map((step, index) => {
//         const status = stepStatus(step, state.stage);
//         // const detail = stepDetail(step, status, audioCodec);

//         return (
//           <li
//             key={step}
//             className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
//               status === "active"
//                 ? "border-signal/50 bg-signal/5"
//                 : status === "done"
//                   ? "border-border bg-surface"
//                   : "border-border/40 bg-transparent opacity-40"
//             }`}
//           >
//             <span className="font-mono text-xs text-ink-muted">{String(index + 1).padStart(2, "0")}</span>
//             <span className="flex-1 text-sm text-ink-primary">{STEP_LABEL[step]}</span>
//             {/* {detail && <span className="font-mono text-xs text-ink-secondary">{detail}</span>} */}
//             {status === "done" && (
//               <span className="text-success" aria-label="complete">
//                 ✓
//               </span>
//             )}
//             {status === "active" && (
//               <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" aria-hidden="true" />
//             )}
//           </li>
//         );
//       })}
//     </ol>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";
import type { PipelineState } from "@/core/pipeline/ExtractionPipeline";

interface PipelineStepsProps {
  state: PipelineState;
}

type StepKey = "validating" | "extracting" | "uploading";
type StepStatus = "pending" | "active" | "done" | "error";

const STEP_ORDER: StepKey[] = ["validating", "extracting", "uploading"];

const STEP_LABEL: Record<StepKey, string> = {
  validating: "Validating file",
  extracting: "Extracting audio",
  uploading: "Uploading",
};

// Which step a given non-terminal stage belongs to.
const STAGE_STEP_INDEX: Partial<Record<PipelineState["stage"], number>> = {
  validating: 0,
  extracting: 1,
  extracted: 1, // finished extracting, about to hand off to upload
  uploading: 2,
  uploaded: 2,
};

export function PipelineSteps({ state }: PipelineStepsProps) {
  // error/aborted states don't carry "which step failed", so we remember
  // the last non-terminal step we were on and treat that as the failure point.
  const lastActiveStepRef = useRef<number>(0);

  if (state.stage !== "error" && state.stage !== "aborted" && state.stage !== "idle") {
    lastActiveStepRef.current = STAGE_STEP_INDEX[state.stage] ?? lastActiveStepRef.current;
  }

  if (state.stage === "idle") return null;

  const failedStepIndex =
    state.stage === "error" || state.stage === "aborted" ? lastActiveStepRef.current : null;

  return (
    <ol className="flex flex-col gap-2.5">
      {STEP_ORDER.map((step, index) => {
        const status = getStepStatus(step, index, state, failedStepIndex);
        return (
          <li
            key={step}
            className={`flex flex-col gap-2 rounded-lg border px-4 py-3 transition-colors ${
              status === "active"
                ? "border-signal/50 bg-signal/5"
                : status === "done"
                  ? "border-border bg-surface"
                  : status === "error"
                    ? "border-danger/50 bg-danger/5"
                    : "border-border/40 bg-transparent opacity-40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm text-ink-primary">{STEP_LABEL[step]}</span>
              <StepDetail step={step} state={state} />
              {status === "done" && (
                <span className="text-success" aria-label="complete">
                  ✓
                </span>
              )}
              {status === "active" && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal" aria-hidden="true" />
              )}
              {status === "error" && (
                <span className="text-danger" aria-label="failed">
                  ✕
                </span>
              )}
            </div>

            {step === "extracting" && state.stage === "extracting" && (
              <ProgressBar percent={state.percent} />
            )}
            {step === "uploading" && state.stage === "uploading" && (
              <ProgressBar percent={state.percent} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function getStepStatus(
  step: StepKey,
  index: number,
  state: PipelineState,
  failedStepIndex: number | null,
): StepStatus {
  if (failedStepIndex !== null) {
    if (index < failedStepIndex) return "done";
    if (index === failedStepIndex) return "error";
    return "pending";
  }

  const currentIndex = STAGE_STEP_INDEX[state.stage];
  if (currentIndex === undefined) return "pending";

  if (index < currentIndex) return "done";
  if (index === currentIndex) {
    // "extracted"/"uploaded" mean that step's work is finished, not still active
    if (state.stage === "extracted" || state.stage === "uploaded") return "done";
    return "active";
  }
  return "pending";
}

function StepDetail({ step, state }: { step: StepKey; state: PipelineState }) {
  if (step === "extracting" && state.stage === "extracting") {
    return (
      <span className="font-mono text-xs text-ink-secondary">
        {formatBytes(state.processedBytes)} / {formatBytes(state.fileSizeBytes)}
      </span>
    );
  }
  if (step === "uploading" && state.stage === "uploading") {
    return <span className="font-mono text-xs text-ink-secondary">{state.percent}%</span>;
  }
  return null;
}

function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
      <div
        className="h-full rounded-full bg-signal transition-[width] duration-150 ease-out"
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}