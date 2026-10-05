import type { ReactNode } from 'react';

export function StepHeader({ title, description }: { title: string; description: ReactNode }) {
   return (
      <div className="space-y-2">
         <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
         <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
   );
}

export function StepProgress({ current, total }: { current: number; total: number }) {
   return (
      <div role="img" aria-label={`Step ${current} of ${total}`} className="flex gap-1.5">
         {Array.from({ length: total }, (_, index) => (
            <span
               key={index}
               className={
                  index < current
                     ? 'h-1 flex-1 rounded-full bg-accent'
                     : 'h-1 flex-1 rounded-full bg-border'
               }
            />
         ))}
      </div>
   );
}
