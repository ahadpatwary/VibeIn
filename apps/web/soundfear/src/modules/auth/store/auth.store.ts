import { create } from 'zustand';
import { setAccessTokenProvider } from '@/lib/http';
import type { AuthSession, AuthUser } from '../types';

type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthState {
   status: AuthStatus;
   user: AuthUser | null;
   /** Memory only — a page reload drops it and `refreshSession()` gets a new one. */
   accessToken: string | null;
   setSession: (session: AuthSession) => void;
   setUnauthenticated: () => void;
   clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
   status: 'idle',
   user: null,
   accessToken: null,
   setSession: ({ user, accessToken }) => set({ status: 'authenticated', user, accessToken }),
   setUnauthenticated: () => set({ status: 'unauthenticated', user: null, accessToken: null }),
   clear: () => set({ status: 'unauthenticated', user: null, accessToken: null }),
}));

// Let the shared axios client attach the bearer token without importing auth code.
setAccessTokenProvider(() => useAuthStore.getState().accessToken);
