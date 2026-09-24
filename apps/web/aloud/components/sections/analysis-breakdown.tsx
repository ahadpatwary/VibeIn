import { Container, Eyebrow } from '@/components/ui/container';
import { SpellCheck2, Waves, BookOpen, Layers, Code2 } from 'lucide-react';

const metrics = [
   {
      icon: SpellCheck2,
      title: 'Grammar',
      body: 'Tense, articles, prepositions, and agreement — shown as what you said vs. the correct version, and why.',
   },
   {
      icon: Waves,
      title: 'Fluency',
      body: "Speaking pace, hesitation, and restarts — separated from the natural pauses that don't count as mistakes.",
   },
   {
      icon: BookOpen,
      title: 'Vocabulary',
      body: 'Repeated fillers like "basically" or "you know", tracked across sessions with better alternatives.',
   },
   {
      icon: Layers,
      title: 'Communication',
      body: 'Clarity, structure, and logical flow — did the explanation have an intro, a point, and a conclusion?',
   },
   {
      icon: Code2,
      title: 'Technical accuracy',
      body: 'For technical topics: correctness and completeness, kept clearly separate from English mistakes.',
   },
];

export function AnalysisBreakdown() {
   return (
      <section id="analysis" className="border-t border-border py-24">
         <Container>
            <Eyebrow>AI analysis</Eyebrow>
            <h2 className="mt-4 max-w-[26ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
               Five lenses on every session.
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15.5px] leading-relaxed text-muted">
               An English mistake and a technical mistake are never the same thing. Aloud keeps them
               separate, so you always know what to fix and why.
            </p>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
               {metrics.map((m) => (
                  <div key={m.title} className="bg-surface p-7">
                     <m.icon size={19} strokeWidth={1.6} className="text-accent" />
                     <h3 className="mt-4 font-display text-[16.5px] font-semibold">{m.title}</h3>
                     <p className="mt-2 text-[14px] leading-relaxed text-muted">{m.body}</p>
                  </div>
               ))}
               <div className="flex flex-col justify-center bg-surface-2 p-7">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                     Every report
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed">
                     Ends with the top three changes to make next time — not a wall of every
                     possible correction.
                  </p>
               </div>
            </div>
         </Container>
      </section>
   );
}
