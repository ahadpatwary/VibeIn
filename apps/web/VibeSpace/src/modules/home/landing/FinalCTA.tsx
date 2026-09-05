import { Container } from "./ui";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section id="final-cta" className="py-16 sm:py-24">
      <Container className="max-w-2xl text-center">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Start with something you want to change.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            You don&rsquo;t need to have it figured out. You just need to begin.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#log-in"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start your journey
            </a>
            <a
              href="#journeys"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
            >
              Explore journeys
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
