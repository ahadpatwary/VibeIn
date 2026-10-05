'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: Variant;
   size?: Size;
   loading?: boolean;
   fullWidth?: boolean;
   leftIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
   primary: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent-strong',
   secondary: 'border bg-surface text-foreground hover:bg-surface-2',
   ghost: 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
};

const sizes: Record<Size, string> = {
   md: 'h-11 px-4 text-sm',
   sm: 'h-9 px-3 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
   {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      className,
      children,
      disabled,
      type = 'button',
      ...props
   },
   ref,
) {
   return (
      <button
         ref={ref}
         type={type}
         disabled={disabled || loading}
         aria-busy={loading || undefined}
         className={cn(
            'inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-colors',
            'disabled:pointer-events-none disabled:opacity-60',
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className,
         )}
         {...props}
      >
         {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
         {children}
      </button>
   );
});
