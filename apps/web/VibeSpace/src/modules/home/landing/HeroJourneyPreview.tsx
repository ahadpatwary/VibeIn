import { heroJourney } from "@/lib/demo-data";
import { StatusDot } from "./ui";

export function HeroJourneyPreview() {
  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_0_0_var(--color-border)] sm:p-6"
      role="img"
      aria-label={`Example journey card: ${heroJourney.title}, from day 1 to day 120, ending in completion.`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {heroJourney.category}
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
            {heroJourney.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          Completed
        </span>
      </div>

      <ol className="mt-6 space-y-0">
        {heroJourney.stages.map((stage, i) => (
          <li key={stage.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < heroJourney.stages.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[4.5px] top-4 h-full w-px bg-border"
              />
            )}
            <div className="mt-1.5">
              <StatusDot status={stage.status} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Day {stage.day}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground">
                &ldquo;{stage.note}&rdquo;
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-1 text-xs text-muted-foreground">
        Example journey shown for illustration.
      </p>
    </div>
  );
}
