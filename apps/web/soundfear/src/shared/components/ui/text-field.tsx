'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
   label: string;
   error?: string;
   hint?: string;
   /** Rendered on the right of the label row (e.g. "Forgot password?"). */
   labelAction?: ReactNode;
   /** Rendered inside the input on the right (e.g. show/hide password). */
   endAdornment?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
   { label, error, hint, labelAction, endAdornment, className, id, ...props },
   ref,
) {
   const autoId = useId();
   const inputId = id ?? autoId;
   const messageId = `${inputId}-message`;
   const hasMessage = Boolean(error || hint);

   return (
      <div className="space-y-1.5">
         <div className="flex items-center justify-between gap-3">
            <label htmlFor={inputId} className="text-sm font-medium text-foreground">
               {label}
            </label>
            {labelAction}
         </div>
         <div className="relative">
            <input
               ref={ref}
               id={inputId}
               aria-invalid={error ? true : undefined}
               aria-describedby={hasMessage ? messageId : undefined}
               className={cn(
                  'h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-foreground',
                  'placeholder:text-ink-muted transition-colors hover:border-ink-muted',
                  'focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  error &&
                     'border-danger hover:border-danger focus:border-danger focus:ring-danger/25',
                  endAdornment && 'pr-11',
                  className,
               )}
               {...props}
            />
            {endAdornment ? (
               <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div>
            ) : null}
         </div>
         {hasMessage ? (
            <p
               id={messageId}
               role={error ? 'alert' : undefined}
               className={cn('text-xs', error ? 'text-danger' : 'text-muted-foreground')}
            >
               {error ?? hint}
            </p>
         ) : null}
      </div>
   );
});
