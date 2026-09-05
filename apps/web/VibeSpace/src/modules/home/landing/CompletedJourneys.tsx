import { completedJourneys } from "@/lib/demo-data";
import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export function CompletedJourneys() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Learn from people who made it"
            title="Completed journeys, kept as references"
            description="Each of these is a product example — a journey documented end to end, including the parts that were hard."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {completedJourneys.map((journey, i) => (
            <Reveal key={journey.id} delay={i * 80}>
              <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {journey.category}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  {journey.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {journey.duration} · {journey.stageCount} stages
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{journey.lesson}&rdquo;
                </p>
                <a
                  href="#journeys"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  View journey
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
