import { Container } from "./ui";

const columns = [
  {
    title: "Identity",
    links: [
      { label: "About", href: "#top" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Explore", href: "#explore" },
      { label: "Journeys", href: "#journeys" },
      { label: "Community", href: "#community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <Container>
        <div className="grid gap-10 sm:grid-cols-4">
          <div>
            <p className="text-[17px] font-semibold tracking-tight text-foreground">
              Identity
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Document the journey, not just the destination.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-medium text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Identity.
        </p>
      </Container>
    </footer>
  );
}
