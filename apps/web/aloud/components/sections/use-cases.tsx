import { Container, Eyebrow } from '@/components/ui/container';
import { Globe2, Terminal, Briefcase, Presentation } from 'lucide-react';

const cases = [
   {
      icon: Globe2,
      title: 'English speaking',
      body: 'Daily life, movies, university, or anything on your mind — build fluency without a script.',
   },
   {
      icon: Terminal,
      title: 'Technical communication',
      body: 'Explain DSA, system design, Kafka, or your own project the way you would in a real interview.',
   },
   {
      icon: Briefcase,
      title: 'Interview preparation',
      body: 'Self-introductions, behavioral answers, and problem-solving reasoning, said out loud.',
   },
   {
      icon: Presentation,
      title: 'Presentation practice',
      body: 'Rehearse a talk end-to-end and see where clarity and structure break down.',
   },
];

export function UseCases() {
   return (
      <section id="use-cases" className="border-t border-border py-24">
         <Container>
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <h2 className="mt-4 max-w-[24ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
               One practice loop, four ways to use it.
            </h2>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
               {cases.map((c) => (
                  <div
                     key={c.title}
                     className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:bg-surface-2"
                  >
                     <c.icon size={20} strokeWidth={1.6} className="text-accent" />
                     <h3 className="mt-5 font-display text-[16px] font-semibold">{c.title}</h3>
                     <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{c.body}</p>
                  </div>
               ))}
            </div>
         </Container>
      </section>
   );
}
