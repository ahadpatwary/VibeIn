"use client";

// import { TopBar } from "@/video_extractor/TopBar";
// import { WaveformHero } from "@/video_extractor/WaveformHero";
// import { DropZone } from "@/video_extractor/DropZone";
// import { PipelineSteps } from "@/video_extractor/PipelineSteps";
// import { ResultPanel } from "@/video_extractor/ResultPanel";
import { useExtractionPipeline } from "@/hooks/useExtractionPipeline";
import { TopBar } from "@/components/video_extractor/TopBar";
import { WaveformHero } from "@/components/video_extractor/WaveformHero";
import { DropZone } from "@/components/video_extractor/DropZone";
import { PipelineSteps } from "@/components/video_extractor/PipelineSteps";
import { ResultPanel } from "@/components/video_extractor/ResultPanel";

export default function HomePage() {
  // const { stage, demuxProgress, uploadProgress, result, error, start, reset } =
  //   useExtractionPipeline();

  const { state, start, reset } = useExtractionPipeline();
  const isBusy = state.stage !== "idle" && state.stage !== "uploaded" && state.stage !== "error";

  return (
    <div className="mx-auto flex min-h-screen max-w-content flex-col px-6 sm:px-10">
      <TopBar />

      <main className="flex flex-1 flex-col gap-10 py-14">
        <section className="flex flex-col gap-6">
          <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-primary sm:text-5xl">
            Pull the audio out.
            <br />
            Leave the video behind.
          </h1>
          <p className="max-w-md text-ink-secondary">
            Drop a video and the audio track comes out in seconds — demuxed entirely in your
            browser, without decoding a single video frame.
          </p>
          <WaveformHero />
        </section>

        <section className="flex flex-col gap-6">
          <DropZone onFileSelected={start} disabled={isBusy} />

          {state.stage === 'error' && (
            <div role="alert" className="rounded-lg border border-danger/40 bg-danger/5 px-4 py-3">
              {/* TODO: here I have to fix the error message because it's a array */}
              <p className="text-sm text-danger">{state.messages[0]}</p> 
              <button
                type="button"
                onClick={reset}
                className="mt-1 text-xs font-medium text-danger underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          <PipelineSteps
            state={state}
            // audioCodec={undefined}
          />

          {state.stage === 'extracted' && <ResultPanel result={state} onReset={reset} />}
        </section>
      </main>

      <footer className="border-t border-border/60 py-6">
        <p className="font-mono text-[11px] text-ink-muted">
          nothing but the audio track ever leaves your device
        </p>
      </footer>
    </div>
  );
}