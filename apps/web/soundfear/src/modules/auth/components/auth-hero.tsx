import Image from 'next/image';
import { siteConfig } from '@/config/site';

/** Deterministic bar heights (integers, so server and client render identical markup). */
const BARS = Array.from({ length: 41 }, (_, i) => {
   const envelope = Math.sin((Math.PI * i) / 40);
   const texture = Math.abs(Math.sin(i * 0.9) * 0.55 + Math.sin(i * 0.37 + 1) * 0.45);
   return 14 + Math.round(86 * envelope * texture);
});

const { heroImage, heroAlt, heroHeadline, heroSubline } = siteConfig.auth;

/**
 * Right half of the auth screen (laptop and up). Renders the supplied picture when
 * `siteConfig.auth.heroImage` is set, otherwise a designed waveform panel.
 */
export function AuthHero() {
   if (heroImage) {
      return (
         <div className="relative h-full w-full overflow-hidden bg-surface-2">
            <Image
               src={heroImage}
               alt={heroAlt}
               fill
               priority
               sizes="50vw"
               className="object-cover"
            />
            <div
               className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
               aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-12 text-white">
               <p className="text-3xl font-semibold tracking-tight">{heroHeadline}</p>
               <p className="max-w-md text-sm text-white/80">{heroSubline}</p>
            </div>
         </div>
      );
   }

   return (
      <div
         className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-surface-2 p-12"
         aria-hidden
      >
         <div
            className="absolute inset-0"
            style={{
               backgroundImage:
                  'radial-gradient(60% 50% at 25% 15%, hsl(var(--accent) / 0.25), transparent 70%), radial-gradient(55% 45% at 85% 90%, hsl(var(--mint) / 0.2), transparent 70%)',
            }}
         />
         <div className="bg-grain absolute inset-0 opacity-70" />

         <div className="relative" />

         <div className="relative flex flex-1 items-center justify-center">
            <div className="relative flex h-80 w-80 items-center justify-center">
               {[0, 1, 2].map((ring) => (
                  <span
                     key={ring}
                     className="absolute inset-0 animate-ring-pulse rounded-full border border-accent/40"
                     style={{ animationDelay: `${ring * 1.3}s` }}
                  />
               ))}
               <div className="relative flex h-44 w-full items-center justify-center gap-[3px]">
                  {BARS.map((height, index) => (
                     <span
                        key={index}
                        className="w-[3px] origin-center animate-wave rounded-full bg-accent"
                        style={{ height: `${height}%`, animationDelay: `${(index % 13) * 110}ms` }}
                     />
                  ))}
               </div>
            </div>
         </div>

         <div className="relative max-w-md space-y-2">
            <p className="text-3xl font-semibold tracking-tight text-foreground">{heroHeadline}</p>
            <p className="text-sm text-muted-foreground">{heroSubline}</p>
         </div>
      </div>
   );
}
