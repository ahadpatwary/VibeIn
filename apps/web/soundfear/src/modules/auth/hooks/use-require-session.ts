'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi } from '../services';
import { useAuthStore } from '../store/auth.store';

/**
 * For protected pages: restores the session from the refresh cookie after a reload,
 * and sends the visitor to /login (remembering where they were) if there isn't one.
 */
export function useRequireSession() {
   const router = useRouter();
   const pathname = usePathname();
   const status = useAuthStore((state) => state.status);
   const user = useAuthStore((state) => state.user);
   const setSession = useAuthStore((state) => state.setSession);
   const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

   useEffect(() => {
      if (status !== 'idle') return;
      let cancelled = false;
      authApi
         .refreshSession()
         .then((session) => {
            if (!cancelled) setSession(session);
         })
         .catch(() => {
            if (!cancelled) setUnauthenticated();
         });
      return () => {
         cancelled = true;
      };
   }, [status, setSession, setUnauthenticated]);

   useEffect(() => {
      if (status === 'unauthenticated') {
         router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
   }, [status, pathname, router]);

   return { status, user };
}
