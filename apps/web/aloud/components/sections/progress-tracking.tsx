import { Container, Eyebrow } from "@/components/ui/container";

const months = [
  { label: "Month 1", grammar: 5.8, fluency: 5.4 },
  { label: "Month 2", grammar: 6.6, fluency: 6.3 },
  { label: "Month 3", grammar: 7.4, fluency: 7.1 },
  { label: "Month 4", grammar: 7.9, fluency: 7.6 },
];

function points(values: number[], height: number) {
  const max = 10;
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = height - (v / max) * height;
      return `${x},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ProgressTracking() {
  const h = 120;
  const grammarPts = points(months.map((m) => m.grammar), h);
  const fluencyPts = points(months.map((m) => m.fluency), h);

  return (
    <section className="border-t border-border py-24">
      <Container className="grid gap-14 lg:grid-cols-[0.85fr,1.15fr] lg:items-center">
        <div>
          <Eyebrow>Long-term progress</Eyebrow>
          <h2 className="mt-4 max-w-[24ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            No session stands alone.
          </h2>
          <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-muted">
            Aloud remembers your recurring mistakes — first detected, how
            often, and whether they&apos;re fading. Your next practice
            recommendation is based on what&apos;s actually still wrong.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Sessions logged
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold">63</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                Filler words
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-mint">−41%</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" /> Grammar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-mint" /> Fluency
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted">scale 0–10</span>
          </div>

          <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="mt-6 h-40 w-full">
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="100"
                y1={(h / 3) * i}
                y2={(h / 3) * i}
                className="stroke-border"
                strokeWidth="0.4"
              />
            ))}
            <polyline
              points={grammarPts}
              fill="none"
              className="stroke-accent"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={fluencyPts}
              fill="none"
              className="stroke-mint"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="mt-3 grid grid-cols-4 text-center font-mono text-[11px] text-muted">
            {months.map((m) => (
              <span key={m.label}>{m.label}</span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
