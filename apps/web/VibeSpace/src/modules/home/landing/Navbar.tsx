"use client";

import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Container } from "./ui";

const links = [
  { href: "#explore", label: "Explore" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#journeys", label: "Journeys" },
  { href: "#community", label: "Community" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top" className="text-[17px] font-semibold tracking-tight text-foreground">
          Identity
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <a
            href="#log-in"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </a>
          <a
            href="#start"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start your journey
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              {open ? (
                <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M5 5l14 14M19 5L5 19" />
              ) : (
                <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-foreground hover:bg-surface-elevated"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <a
                href="#log-in"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-foreground hover:bg-surface-elevated"
              >
                Log in
              </a>
              <a
                href="#start"
                onClick={() => setOpen(false)}
                className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                Start your journey
              </a>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
