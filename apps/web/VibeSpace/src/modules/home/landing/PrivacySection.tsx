import { privacyOptions } from "@/lib/demo-data";
import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

export function PrivacySection() {
  return (
    <section className="border-t border-border py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Privacy"
            title="You choose who sees your journey"
            description="Documenting a fear or a personal struggle takes trust. Privacy isn't an afterthought here — it's a setting on every journey you start."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {privacyOptions.map((option, i) => (
            <Reveal key={option.id} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  {option.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
