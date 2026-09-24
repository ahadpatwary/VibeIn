import { Container, Eyebrow } from '@/components/ui/container';

const transcript = [
   {
      text: "So Kafka is basically a... a message queue system, but it's actually more like a distributed log.",
      flag: 'grammar' as const,
   },
   {
      text: 'Producers write to topics, and topics are split into partitions so you can scale horizontally.',
      flag: null,
   },
   {
      text: "Consumers read from partitions with a offset, which tracks how far they've read.",
      flag: 'grammar' as const,
   },
   {
      text: "Unlike a traditional queue, messages aren't removed after reading — they're retained for a configured period.",
      flag: null,
   },
];

const report = [
   { label: 'Grammar', score: '6.8', note: 'Article usage ("a offset") — 4 occurrences' },
   { label: 'Vocabulary', score: '7.2', note: 'Good range; "basically" used 6 times' },
   {
      label: 'Technical accuracy',
      score: '8.7',
      note: 'Correct on partitions, offsets, retention',
   },
   { label: 'Structure', score: '6.7', note: 'Missing a clear conclusion' },
];

export function ProductDemo() {
   return (
      <section id="product-demo" className="border-t border-border py-24">
         <Container>
            <Eyebrow>Product demo</Eyebrow>
            <h2 className="mt-4 max-w-[26ch] font-display text-3xl font-semibold tracking-tight sm:text-4xl">
               From raw transcript to a report you can use.
            </h2>

            <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
               <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                     <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                        Transcript · &quot;Explain Kafka&quot;
                     </p>
                     <span className="font-mono text-[11px] text-muted">18:42</span>
                  </div>
                  <div className="mt-6 space-y-4">
                     {transcript.map((line, i) => (
                        <p key={i} className="text-[15px] leading-relaxed">
                           {line.flag === 'grammar' ? (
                              <span className="rounded-[3px] bg-accent/15 px-1 py-0.5 decoration-accent underline decoration-wavy underline-offset-4">
                                 {line.text}
                              </span>
                           ) : (
                              <span className="text-muted">{line.text}</span>
                           )}
                        </p>
                     ))}
                  </div>
               </div>

               <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                     AI report
                  </p>
                  <p className="mt-2 font-display text-3xl font-semibold">
                     7.4<span className="text-base font-normal text-muted">/10 overall</span>
                  </p>

                  <div className="mt-6 divide-y divide-border">
                     {report.map((r) => (
                        <div
                           key={r.label}
                           className="flex items-start justify-between gap-4 py-3.5"
                        >
                           <div>
                              <p className="text-[14px] font-medium">{r.label}</p>
                              <p className="mt-0.5 text-[12.5px] text-muted">{r.note}</p>
                           </div>
                           <span className="shrink-0 font-mono text-[14px] text-accent">
                              {r.score}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </Container>
      </section>
   );
}
