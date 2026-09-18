import { Container, Eyebrow } from "@/components/ui/container";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
      "3 sessions / week",
      "Up to 10 minutes per session",
      "Grammar, fluency & vocabulary analysis",
      "7-day session history",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$14",
    period: "/ month",
    highlight: true,
    features: [
      "Unlimited sessions",
      "Up to 60 minutes per session",
      "Technical communication analysis",
      "Long-term progress & mistake memory",
      "Personalized AI coaching",
    ],
    cta: "Go Pro",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border py-24">
      <Container>
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Start free. Upgrade when it&apos;s paying off.
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:max-w-[720px]">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={cn(
                "relative rounded-2xl border p-8",
                t.highlight
                  ? "border-accent/40 bg-surface shadow-[0_0_0_1px_hsl(var(--accent)/0.12)]"
                  : "border-border bg-surface"
              )}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-[17px] font-semibold">{t.name}</h3>
              <p className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold">{t.price}</span>
                <span className="text-[13px] text-muted">{t.period}</span>
              </p>

              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px]">
                    <Check size={14} className="mt-0.5 shrink-0 text-mint" strokeWidth={2.25} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#start"
                className={cn(
                  "mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-[13.5px] font-medium transition-opacity hover:opacity-90",
                  t.highlight
                    ? "bg-foreground text-background"
                    : "border border-border bg-transparent text-foreground"
                )}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
