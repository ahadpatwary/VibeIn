import { cn } from '@/lib/utils';

type WaveformProps = {
   bars?: number;
   className?: string;
   barClassName?: string;
   active?: boolean;
   seed?: number;
};

/**
 * The product's signature motif: a bar waveform that breathes while
 * "listening" and can be frozen into a static shape (e.g. once a
 * session ends and analysis begins). Heights are deterministic per
 * `seed` so server and client render the same markup.
 */
export function Waveform({
   bars = 28,
   className,
   barClassName,
   active = true,
   seed = 7,
}: WaveformProps) {
   const heights = Array.from({ length: bars }, (_, i) => {
      const v = Math.sin(i * seed * 0.35) * 0.5 + 0.5;
      return 0.25 + v * 0.75;
   });

   return (
      <div className={cn('flex items-center gap-[3px]', className)} aria-hidden="true">
         {heights.map((h, i) => (
            <span
               key={i}
               className={cn(
                  'w-[3px] rounded-full bg-accent/80',
                  active && 'animate-bar-idle',
                  barClassName,
               )}
               style={{
                  height: `${Math.max(h * 100, 14)}%`,
                  animationDelay: `${(i % 9) * 0.09}s`,
               }}
            />
         ))}
      </div>
   );
}
