import { Container, Eyebrow } from "./ui";
import { HeroJourneyPreview } from "./HeroJourneyPreview";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-14 sm:pt-20">
      <Container className="grid items-center gap-12 pb-16 sm:pb-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Your journey matters</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]">
            Don&rsquo;t just show who you became.
            <br />
            Show how you became.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Learn a skill. Face a fear. Build something meaningful. Document
            the real journey — from the first attempt to the breakthrough.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              id="start"
              href="#final-cta"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start your journey
            </a>
            <a
              href="#journeys"
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated"
            >
              Explore real journeys
            </a>
          </div>
        </div>

        <HeroJourneyPreview />
      </Container>
    </section>
  );
}
