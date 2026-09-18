export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-border/60 px-6 py-4 sm:px-10">
      <div className="flex items-center gap-2.5">
        <span className="inline-block h-2 w-2 rounded-full bg-signal" aria-hidden="true" />
        <span className="font-display text-sm font-semibold tracking-tight text-ink-primary">
          audio/extract
        </span>
      </div>
      <span className="font-mono text-xs text-ink-muted">runs in your browser</span>
    </header>
  );
}
