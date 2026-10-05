'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSafeRedirect } from '../lib/redirect';
import { useAuthStore } from '../store/auth.store';
import type { AuthSession } from '../types';

/**
 * Single exit point for every successful login/registration (credentials or provider):
 * stores the session in memory and navigates client-side — no full page reload.
 */
export function useCompleteAuth(next?: string) {
   const router = useRouter();
   const setSession = useAuthStore((state) => state.setSession);

   return useCallback(
      (session: AuthSession) => {
         setSession(session);
         router.replace(getSafeRedirect(next));
      },
      [router, next, setSession],
   );
}
