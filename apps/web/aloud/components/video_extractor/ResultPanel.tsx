// "use client";

// import { useMemo } from "react";
// import type { PipelineResult } from "@/core/pipeline/types";
// import { formatBytes, formatCodec, formatDuration, formatReduction } from "@/lib/format";

// interface ResultPanelProps {
//   result: PipelineResult;
//   onReset: () => void;
// }

// export function ResultPanel({ result, onReset }: ResultPanelProps) {
//   console.log("blob", result.blob);
//   console.log("blobsize", result.blob.size);
//   console.log("blob type", result.blob.type);
//   const objectUrl = useMemo(() => URL.createObjectURL(result.blob), [result.blob]);

//   const audio = document.createElement("audio");
//   const blob = result.blob;

// console.log("MIME:", blob.type);
// console.log(
//   "canPlayType:",
//   audio.canPlayType(blob.type),
// );

// const url = URL.createObjectURL(blob);

// audio.src = url;

// audio.addEventListener("loadedmetadata", () => {
//   console.log("✅ loadedmetadata");
//   console.log("duration:", audio.duration);
// });

// audio.addEventListener("canplay", () => {
//   console.log("✅ canplay");
// });

// audio.addEventListener("playing", () => {
//   console.log("✅ playing");
// });

// audio.addEventListener("error", () => {
//   console.log("❌ AUDIO ERROR");
//   console.log("error:", audio.error);
//   console.log("error code:", audio.error?.code);
//   console.log("error message:", audio.error?.message);
// });

// audio.addEventListener("stalled", () => {
//   console.log("⚠️ stalled");
// });

// audio.load();

//   console.log("objectUrl", objectUrl);
//   return (
//     <div className="rounded-xl border border-border bg-surface p-5">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <p className="font-display text-sm font-medium text-ink-primary">{result.fileName}</p>
//           {/* <p className="mt-1 font-mono text-xs text-ink-secondary">
//             {formatDuration(result.track.duration)} · {formatCodec(result.track.codec)} ·{" "}
//             {result.track.sampleRate ? `${result.track.sampleRate / 1000}kHz · ` : ""}
//             {formatBytes(result.blob.size)} · {formatReduction(result.sourceSizeBytes, result.blob.size)}
//           </p> */}
//         </div>
//         <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-xs text-success">
//           sent to backend
//         </span>
//       </div>

//       <audio controls src={objectUrl} className="mt-4 w-full" />

//       <div className="mt-4 flex flex-wrap items-center gap-3">
//         <a
//           href={objectUrl}
//           download={result.fileName}
//           className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:border-signal hover:text-signal"
//         >
//           Download {result.fileName}
//         </a>
//         <button
//           type="button"
//           onClick={onReset}
//           className="rounded-lg px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
//         >
//           Extract another file
//         </button>
//       </div>

//       <p className="mt-4 font-mono text-[11px] text-ink-muted">file key: {result.fileKey}</p>
//     </div>
//   );
// }
"use client";

import { useMemo, useEffect } from "react";
import type { PipelineResult } from "@/core/pipeline/types";
import { formatBytes, formatCodec, formatDuration, formatReduction } from "@/lib/format";
    // track?: AudioTrackInfo | undefined;
    // blob: Blob;
    // fileName: string;
    // sourceSizeBytes: number;
    // fileKey: string;

interface ResultPanelProps {
  result: {
    stage: "extracted";
    fileSizeBytes: number;
    fileName: string;
    blob: Blob;
  };
  onReset: () => void;
}

export function ResultPanel({ result, onReset }: ResultPanelProps) {
  // Mobile browser er jonno codec string strip kore shudhu main type (e.g., audio/mp4) rakha
  const playableBlob = useMemo(() => {
    const cleanType = result.blob.type.split(';')[0];
    return new Blob([result.blob], { type: cleanType });
  }, [result.blob]);

  const objectUrl = useMemo(() => URL.createObjectURL(playableBlob), [playableBlob]);
  console.log("url", objectUrl.length);

  // Debugging ba event listener er kaj gulo useEffect er moddhe rakha
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = objectUrl;

    const handleLoadedMetadata = () => {
      console.log("✅ loadedmetadata, duration:", audio.duration);
    };

    const handleError = () => {
      console.log("❌ AUDIO ERROR:", audio.error);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("error", handleError);
    audio.load();

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("error", handleError);
    };
  }, [objectUrl]);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium text-ink-primary">{result.fileName}</p>
        </div>
        <span className="rounded-full bg-success/10 px-2.5 py-1 font-mono text-xs text-success">
          sent to backend
        </span>
      </div>

      {/* Mobile-friendly audio element */}
      <audio 
        controls 
        preload="metadata"
        src={objectUrl} 
        className="mt-4 w-full"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={objectUrl}
          download={result.fileName}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-primary transition-colors hover:border-signal hover:text-signal"
        >
          Download {result.fileName}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink-primary"
        >
          Extract another file
        </button>
      </div>

      {/* <p className="mt-4 font-mono text-[11px] text-ink-muted">file key: {result.fileKey}</p> */}
    </div>
  );
}