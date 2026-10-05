'use client';

import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Brand, authApi, useAuthStore, useRequireSession } from '@/modules/auth';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { Button } from '@/shared/components/ui/button';

/** Placeholder protected page so you can see the end of the auth flow. */
export default function DashboardPage() {
   const router = useRouter();
   const clear = useAuthStore((state) => state.clear);
   const { status, user } = useRequireSession();

   const signOut = async () => {
      try {
         await authApi.logout();
      } finally {
         clear();
         router.replace('/login');
      }
   };

   if (status !== 'authenticated' || !user) {
      return (
         <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" />
         </div>
      );
   }

   return (
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-5 sm:px-8">
         <header className="flex items-center justify-between">
            <Brand href="/dashboard" />
            <ThemeToggle />
         </header>
         <main className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-md space-y-5 rounded-2xl border bg-surface p-6 text-center shadow-sm sm:p-8">
               <h1 className="text-2xl font-semibold tracking-tight">You&apos;re signed in</h1>
               <p className="break-all text-sm text-muted-foreground">{user.email}</p>
               <Button variant="secondary" onClick={signOut}>
                  Log out
               </Button>
            </div>
         </main>
      </div>
   );
}
