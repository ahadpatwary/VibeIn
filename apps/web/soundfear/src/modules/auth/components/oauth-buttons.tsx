'use client';

import { useState } from 'react';
import { getErrorMessage, type ApiError } from '@/lib/api-error';
import { useOAuthSession } from '../hooks/use-auth-mutations';
import { useOAuthPopup } from '../hooks/use-oauth-popup';
import type { AuthSession, OAuthProvider } from '../types';
import { GitHubIcon, GoogleIcon } from '@/shared/components/icons';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';

interface OAuthButtonsProps {
   mode: 'login' | 'register';
   disabled?: boolean;
   onAuthenticated: (session: AuthSession) => void;
}

const PROVIDERS: Array<{ id: OAuthProvider; label: string; Icon: typeof GoogleIcon }> = [
   { id: 'google', label: 'Google', Icon: GoogleIcon },
   { id: 'github', label: 'GitHub', Icon: GitHubIcon },
];

export function OAuthButtons({ mode, disabled, onAuthenticated }: OAuthButtonsProps) {
   const [error, setError] = useState<string | null>(null);
   const exchange = useOAuthSession();

   const { start, cancel, pendingProvider } = useOAuthPopup({
      onSuccess: () => {
         exchange.mutate(undefined, {
            onSuccess: onAuthenticated,
            onError: (e: ApiError) => setError(getErrorMessage(e)),
         });
      },
      onError: (e) => setError(getErrorMessage(e)),
   });

   const busy = pendingProvider !== null || exchange.isPending;
   const verb = mode === 'register' ? 'Sign up' : 'Continue';

   return (
      <div className="space-y-3">
         {error ? <Alert>{error}</Alert> : null}

         <div className="grid grid-cols-2 gap-3">
            {PROVIDERS.map(({ id, label, Icon }) => {
               const isThis = pendingProvider === id;
               return (
                  <Button
                     key={id}
                     variant="secondary"
                     fullWidth
                     disabled={disabled || (busy && !isThis)}
                     loading={isThis}
                     aria-label={`${verb} with ${label}`}
                     onClick={() => {
                        setError(null);
                        start(id);
                     }}
                     leftIcon={<Icon className="h-[18px] w-[18px]" />}
                  >
                     {label}
                  </Button>
               );
            })}
         </div>

         {busy ? (
            <p
               role="status"
               className="flex items-center justify-between gap-3 text-xs text-muted-foreground"
            >
               <span>
                  {exchange.isPending
                     ? 'Finishing sign-in…'
                     : 'Finish signing in in the pop-up window.'}
               </span>
               {pendingProvider ? (
                  <button
                     type="button"
                     onClick={cancel}
                     className="font-medium text-foreground underline underline-offset-4 hover:text-accent-strong"
                  >
                     Cancel
                  </button>
               ) : null}
            </p>
         ) : null}
      </div>
   );
}
