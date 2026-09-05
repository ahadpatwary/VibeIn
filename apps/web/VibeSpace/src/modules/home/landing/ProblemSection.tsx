import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const socialSteps = ["Success", "Post", "Like"];
const identitySteps = [
  "Goal",
  "Attempt",
  "Failure",
  "Lesson",
  "Progress",
  "Breakthrough",
  "Completion",
];

function StepColumn({
  title,
  steps,
  emphasis,
}: {
  title: string;
  steps: string[];
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "rounded-2xl border border-primary/30 bg-primary/5 p-6"
          : "rounded-2xl border border-border bg-surface p-6"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-5 flex flex-col items-start">
        {steps.map((step, i) => (
          <div key={step} className="flex flex-col items-start">
            <span
              className={
                emphasis
                  ? "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-lg bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground"
              }
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="my-1.5 pl-3.5 text-muted-foreground" aria-hidden="true">
                ↓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section id="explore" className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="The internet shows you the finish line."
            description="Most content online shows the result, the achievement, the polished version — rarely the failed attempts, the uncertainty, or the moments someone wanted to quit. Identity is built around the part people usually leave out: the journey."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Reveal>
            <StepColumn title="Traditional social media" steps={socialSteps} />
          </Reveal>
          <Reveal delay={100}>
            <StepColumn title="Identity" steps={identitySteps} emphasis />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
