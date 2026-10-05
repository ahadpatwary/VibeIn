import Link from 'next/link';
import { AudioWaveform } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

export function Brand({ className, href = '/' }: { className?: string; href?: string }) {
   return (
      <Link
         href={href}
         className={cn('inline-flex items-center gap-2.5', className)}
         aria-label={siteConfig.name}
      >
         <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
            <AudioWaveform className="h-5 w-5" aria-hidden />
         </span>
         <span className="text-base font-semibold tracking-tight text-foreground">
            {siteConfig.name}
         </span>
      </Link>
   );
}
