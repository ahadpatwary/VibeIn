import { Container } from "@/components/ui/container";
import { Waveform } from "@/components/ui/waveform";

const columns = [
  {
    title: "Product",
    links: ["How it works", "Analysis", "Use cases", "Pricing"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Data & recordings"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Waveform bars={5} className="h-4" barClassName="bg-accent" active={false} seed={11} />
              <span className="font-display text-[17px] font-semibold">Aloud</span>
            </div>
            <p className="mt-3 max-w-[32ch] text-[13.5px] leading-relaxed text-muted">
              Talk to yourself, freely. Let AI analyze you afterward.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13.5px] text-foreground/80 hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-[12.5px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Aloud. All rights reserved.</span>
          <span>Built for learners, developers, and speakers.</span>
        </div>
      </Container>
    </footer>
  );
}
