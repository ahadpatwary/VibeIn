import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { Waveform } from "@/components/ui/waveform";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#analysis", label: "Analysis" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Waveform bars={5} className="h-4" barClassName="bg-accent" active seed={11} />
          <span className="font-display text-[19px] font-semibold tracking-tight">
            Aloud
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <a
            href="/video_extractor"
            className="hidden rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Start speaking
          </a>
        </div>
      </Container>
    </header>
  );
}
