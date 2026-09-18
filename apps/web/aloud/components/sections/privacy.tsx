import { Container } from "@/components/ui/container";
import { ShieldCheck } from "lucide-react";

export function Privacy() {
  return (
    <section className="border-t border-border py-20">
      <Container>
        <div className="flex flex-col items-start gap-6 rounded-2xl border border-border bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2">
            <ShieldCheck size={19} strokeWidth={1.6} className="text-accent" />
          </div>
          <div>
            <h3 className="font-display text-[17px] font-semibold">
              Your voice stays yours
            </h3>
            <p className="mt-1.5 max-w-[70ch] text-[14.5px] leading-relaxed text-muted">
              Recordings and transcripts are stored per-account, encrypted at
              rest, and never used to train models without explicit consent.
              You can delete any session — audio, transcript, and report —
              at any time.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
