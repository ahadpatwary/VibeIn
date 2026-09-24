import { Container } from '@/components/ui/container';
import { Waveform } from '@/components/ui/waveform';
import { Mic } from 'lucide-react';

export function FinalCta() {
   return (
      <section className="border-t border-border py-24">
         <Container>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface px-8 py-16 text-center sm:px-16">
               <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]"
                  aria-hidden="true"
               />
               <div className="relative">
                  <Waveform bars={22} className="mx-auto h-8" seed={13} />
                  <h2 className="mx-auto mt-7 max-w-[20ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                     Start your first speaking session.
                  </h2>
                  <p className="mx-auto mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-muted">
                     No topic required. No time limit until you hit it. Just talk, and let the
                     report show you the rest.
                  </p>
                  <a
                     href="#start"
                     className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-[14px] font-medium text-background transition-transform hover:scale-[1.02]"
                  >
                     <Mic size={16} strokeWidth={2} />
                     Start speaking — it&apos;s free
                  </a>
               </div>
            </div>
         </Container>
      </section>
   );
}
