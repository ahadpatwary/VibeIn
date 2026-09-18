import { Container } from "@/components/ui/container";
import { Waveform } from "@/components/ui/waveform";
import { Mic, Square } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 md:pb-28 md:pt-24" id="start">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-grain opacity-[0.35]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[-180px] -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        aria-hidden="true"
      />

      <Container className="grid items-center gap-16 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="animate-fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-accent animate-pulse-ring" />
            The AI stays silent while you speak
          </div>

          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-[3.4rem] lg:text-[3.75rem]">
            Speak freely.
            <br />
            Get better <span className="text-accent">every time.</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-muted">
            Talk about anything for as long as you want — English practice, a
            system design walkthrough, an interview answer. No interruptions,
            no predefined questions. When you&apos;re done, Aloud analyzes the
            whole session and shows you exactly how to improve.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-[14px] font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <Mic size={16} strokeWidth={2} />
              Start speaking
            </a>
            <a
              href="#product-demo"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-[14px] font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
            <span>No scripted questions</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Full-session analysis</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span className="hidden sm:block">Long-term progress</span>
          </div>
        </div>

        {/* Signature element: a "session card" showing the AI listening in
            silence, which morphs conceptually into a scored report. */}
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_1px_0_hsl(var(--border))]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="font-mono text-[12px] text-muted">
                  session · system design explanation
                </span>
              </div>
              <span className="font-mono text-[12px] text-muted">24:18</span>
            </div>

            <div className="flex h-44 items-center justify-center px-8">
              <Waveform bars={38} className="h-16 w-full" seed={5} />
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-4">
              <div className="flex items-center gap-2 text-[13px] text-muted">
                <Square size={13} className="fill-current" strokeWidth={0} />
                AI is listening — it won&apos;t interrupt
              </div>
              <span className="rounded-full bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted">
                REC
              </span>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-6 w-[240px] rounded-xl border border-border bg-surface p-4 shadow-lg sm:-left-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              Session report
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">7.4<span className="text-muted text-base font-normal">/10</span></p>
            <div className="mt-3 space-y-1.5">
              {[
                ["Clarity", 80],
                ["Fluency", 75],
                ["Technical accuracy", 87],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center gap-2">
                  <span className="w-[112px] shrink-0 text-[11px] text-muted">{label}</span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-mint"
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
