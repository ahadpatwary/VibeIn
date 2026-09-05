import { howItWorksSteps } from "@/lib/demo-data";
import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How it works" title="From goal to roadmap" />
        </Reveal>

        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {howItWorksSteps.map((step, i) => (
            <Reveal key={step.number} delay={i * 80}>
              <li className="h-full rounded-2xl border border-border bg-surface p-5">
                <span className="text-sm font-semibold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
