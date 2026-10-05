'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
   const { resolvedTheme, setTheme } = useTheme();
   const [mounted, setMounted] = React.useState(false);

   React.useEffect(() => setMounted(true), []);

   if (!mounted) {
      return <div className={cn('h-9 w-9 rounded-full', className)} />;
   }

   const isDark = resolvedTheme === 'dark';

   return (
      <button
         type="button"
         aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
         onClick={() => setTheme(isDark ? 'light' : 'dark')}
         className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border',
            'bg-surface text-foreground transition-colors hover:bg-surface-2',
            className,
         )}
      >
         {isDark ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
      </button>
   );
}
