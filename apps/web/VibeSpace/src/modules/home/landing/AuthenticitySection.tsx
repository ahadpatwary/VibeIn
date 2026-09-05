import { Container, SectionHeading } from "./ui";
import { Reveal } from "./Reveal";

const formats = [
  {
    title: "Text",
    description: "Your words remain your words.",
  },
  {
    title: "Voice",
    description: "Your real voice — or an optional privacy-preserving representation.",
  },
  {
    title: "Video",
    description: "Your original journey, preserved as part of the workflow.",
  },
];

export function AuthenticitySection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Authentic by design"
            title="Your journey stays yours"
            description="Identity doesn't rewrite people's experiences into polished motivational content. AI can help with discovery, organization, and accessibility — it should never rewrite who you were."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {formats.map((format, i) => (
            <Reveal key={format.title} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="text-base font-semibold text-foreground">
                  {format.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {format.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={240}>
          <p className="mt-8 text-sm font-medium text-foreground">
            AI can help organize your journey. It should never rewrite who you were.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
