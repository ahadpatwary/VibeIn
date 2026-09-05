import { stageMatchingExample } from "@/lib/demo-data";
import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export function StageMatching() {
  const { journeyTitle, currentDay, totalDays, groups } = stageMatchingExample;
  const progressPct = Math.round((currentDay / totalDays) * 100);

  return (
    <section id="community" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Same place, different stage"
            title="Find people who are where you are."
            description="Identity connects you with people beginning the same journey, people struggling alongside you right now, and people who've already made it through."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{journeyTitle}</p>
              <p className="text-xs text-muted-foreground">
                Day {currentDay} of {totalDays}
              </p>
            </div>

            <div
              className="relative mt-6"
              role="img"
              aria-label={`Progress timeline: currently on day ${currentDay} of ${totalDays}.`}
            >
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div
                className="absolute -top-1 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${progressPct}%` }}
              >
                <span className="h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
                <span className="mt-1 whitespace-nowrap text-[11px] font-medium text-primary">
                  You are here
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Illustrative example</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <p className="text-2xl font-semibold text-foreground">
                    {group.count}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {group.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {group.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="#journeys"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Explore people like me
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
