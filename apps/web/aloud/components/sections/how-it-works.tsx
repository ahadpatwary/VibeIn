import { Container, Eyebrow } from "@/components/ui/container";
import { Mic, EarOff, ScanSearch, ChartLine } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Choose a topic, or don't",
    body: "Explain Kafka, practice self-introduction, or just talk about your day. Nothing is scripted.",
  },
  {
    icon: EarOff,
    title: "Speak without interruption",
    body: "Talk for 10 minutes or 60. The AI stays completely silent — it's listening, not chatting.",
  },
  {
    icon: ScanSearch,
    title: "Full-session analysis",
    body: "Grammar, fluency, vocabulary, structure, and technical accuracy — read from the whole transcript.",
  },
  {
    icon: ChartLine,
    title: "A report you can act on",
    body: "See exactly what to fix next, and how this session compares to your last thirty.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-24">
      <Container>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          One continuous loop: speak, analyze, improve.
        </h2>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
            aria-hidden="true"
          />
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                <s.icon size={18} strokeWidth={1.75} className="text-accent" />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-[17px] font-semibold">
                {s.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
