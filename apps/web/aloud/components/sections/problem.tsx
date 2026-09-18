import { Container, Eyebrow } from "@/components/ui/container";
import { Waveform } from "@/components/ui/waveform";
import { X, Check } from "lucide-react";

const oldWay = [
  "Interrupts you mid-thought",
  "Forces short, scripted answers",
  "Predefined questions only",
  "Feedback disappears after the chat",
];

const aloudWay = [
  "Lets you finish every thought",
  "Long-form, free-form speaking",
  "Any topic, any length",
  "Every session builds your profile",
];

export function Problem() {
  return (
    <section className="border-t border-border py-24">
      <Container>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-4 max-w-[26ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Most speaking apps talk over you.
        </h2>
        <p className="mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-muted">
          Chat-style practice tools ask a question, wait for a short reply,
          then jump to the next one. That trains you to give short answers —
          not to think and speak the way you do in a real interview or
          presentation.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
              Typical speaking app
            </p>
            <div className="mt-5 space-y-3">
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-[13.5px]">
                Tell me about a challenge you faced. (15 sec)
              </div>
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-surface-2 px-4 py-2.5 text-[13.5px] text-muted">
                Well, once at my last job I—
              </div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-[13.5px]">
                Got it. Next question: what&apos;s your biggest weakness?
              </div>
            </div>
            <ul className="mt-7 space-y-2.5">
              {oldWay.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-muted">
                  <X size={14} className="mt-0.5 shrink-0 text-muted" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-surface p-7 shadow-[0_0_0_1px_hsl(var(--accent)/0.08)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              Aloud
            </p>
            <div className="mt-5 flex h-[92px] items-center rounded-xl bg-surface-2 px-5">
              <Waveform bars={30} className="h-10 w-full" seed={9} />
            </div>
            <p className="mt-3 text-[13px] text-muted">
              24:41 of uninterrupted speaking — no prompts, no follow-ups.
            </p>
            <ul className="mt-7 space-y-2.5">
              {aloudWay.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px]">
                  <Check size={14} className="mt-0.5 shrink-0 text-mint" strokeWidth={2.25} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
