import { publicSpeakingJourney } from "@/lib/demo-data";
import { Container, SectionHeading, StatusDot } from "./ui";
import { Reveal } from "./Reveal";

export function JourneyShowcase() {
  return (
    <section id="journeys" className="border-t border-border py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="A real journey, start to finish"
            title={publicSpeakingJourney.title}
            description="Progress is not always a straight line. This is what a completed journey actually looks like — setbacks included."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {publicSpeakingJourney.category} · {publicSpeakingJourney.duration}
              </p>
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                Completed
              </span>
            </div>

            <ol className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {publicSpeakingJourney.stages.map((stage) => (
                <li key={stage.id} className="flex gap-3">
                  <div className="mt-1.5">
                    <StatusDot status={stage.status} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Day {stage.day} · {stage.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      &ldquo;{stage.note}&rdquo;
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {publicSpeakingJourney.lesson && (
              <p className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
                {publicSpeakingJourney.lesson}
              </p>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
