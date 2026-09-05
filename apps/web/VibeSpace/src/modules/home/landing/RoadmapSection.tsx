import { Container } from "./ui";
import { Reveal } from "./Reveal";

const loop = [
  "You started here",
  "You struggled here",
  "You learned here",
  "You overcame it",
  "Someone else starts where you once were",
  "Your journey helps them",
];

export function RoadmapSection() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <Container className="max-w-3xl text-center">
        <Reveal>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            One day, someone will need the journey you&rsquo;re building today.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <ol className="mx-auto mt-12 flex max-w-sm flex-col items-center">
            {loop.map((step, i) => (
              <li key={step} className="flex flex-col items-center">
                <span
                  className={
                    i === loop.length - 1
                      ? "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      : "rounded-lg bg-surface-elevated px-4 py-2 text-sm text-foreground"
                  }
                >
                  {step}
                </span>
                {i < loop.length - 1 && (
                  <span className="my-1.5 text-muted-foreground" aria-hidden="true">
                    ↓
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
