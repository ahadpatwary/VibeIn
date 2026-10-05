import type { ReactNode } from 'react';
import { siteConfig } from '@/config/site';
import { AuthHero } from './auth-hero';
import { Brand } from './brand';
import { MockModeNotice } from './mock-mode-notice';
import { ThemeToggle } from '@/shared/components/theme-toggle';

/**
 * Laptop (lg+): form on the left half, picture on the right half.
 * Mobile / tablet: picture is hidden, only the form stays.
 */
export function AuthShell({ children }: { children: ReactNode }) {
   return (
      <div className="min-h-dvh lg:grid lg:grid-cols-2">
         <main className="flex min-h-dvh flex-col px-5 py-5 sm:px-10 lg:px-14 xl:px-20">
            <header className="flex items-center justify-between">
               <Brand href="/login" />
               <ThemeToggle />
            </header>

            <div className="flex flex-1 items-center justify-center py-10">
               <div className="w-full max-w-[26rem]">
                  {children}
                  <MockModeNotice />
               </div>
            </div>

            <footer className="text-xs text-ink-muted">© {siteConfig.name}</footer>
         </main>

         <aside className="relative hidden lg:sticky lg:top-0 lg:block lg:h-dvh">
            <AuthHero />
         </aside>
      </div>
   );
}
