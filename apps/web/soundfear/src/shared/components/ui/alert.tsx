import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'error' | 'success' | 'info';

const styles: Record<Variant, string> = {
   error: 'border-danger/30 bg-danger/10 text-foreground [&>svg]:text-danger',
   success: 'border-success/30 bg-success/10 text-foreground [&>svg]:text-success',
   info: 'border-accent/30 bg-accent/10 text-foreground [&>svg]:text-accent-strong',
};

const icons = {
   error: AlertCircle,
   success: CheckCircle2,
   info: Info,
} satisfies Record<Variant, typeof Info>;

export function Alert({
   variant = 'error',
   children,
   className,
}: {
   variant?: Variant;
   children: ReactNode;
   className?: string;
}) {
   const Icon = icons[variant];
   return (
      <div
         role={variant === 'error' ? 'alert' : 'status'}
         className={cn(
            'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
            styles[variant],
            className,
         )}
      >
         <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
         <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
      </div>
   );
}
