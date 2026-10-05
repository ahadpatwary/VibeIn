import type { ReactNode } from 'react';

export function Divider({ children }: { children: ReactNode }) {
   return (
      <div
         className="flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted"
         role="separator"
      >
         <span className="h-px flex-1 bg-border" />
         <span>{children}</span>
         <span className="h-px flex-1 bg-border" />
      </div>
   );
}
