'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Brand } from '@/modules/auth';
import {
   OAUTH_MESSAGE_SOURCE,
   isOAuthProvider,
   publishOAuthResult,
} from '@/modules/auth/lib/oauth-popup';
import { Button } from '@/shared/components/ui/button';

/**
 * The popup lands here when the provider flow is finished. It reports the result to the
 * main window and closes itself, so the main app never has to reload.
 */
function CallbackInner() {
   const params = useSearchParams();
   const status = params.get('status');
   const popupId = params.get('popup_id');
   const providerParam = params.get('provider');
   const error = params.get('error') ?? undefined;

   const valid = Boolean(popupId) && (status === 'success' || status === 'error');
   const [manual, setManual] = useState(false);

   useEffect(() => {
      if (!valid || !popupId || (status !== 'success' && status !== 'error')) return;

      publishOAuthResult({
         source: OAUTH_MESSAGE_SOURCE,
         type: 'oauth-result',
         popupId,
         provider: isOAuthProvider(providerParam) ? providerParam : null,
         status,
         error,
      });

      const closeTimer = window.setTimeout(() => window.close(), 250);
      const manualTimer = window.setTimeout(() => setManual(true), 1500);
      return () => {
         window.clearTimeout(closeTimer);
         window.clearTimeout(manualTimer);
      };
   }, [valid, popupId, status, providerParam, error]);

   const ok = valid && status === 'success';

   return (
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
         <Brand href="/login" />
         {ok ? (
            <CheckCircle2 className="h-12 w-12 text-success" aria-hidden />
         ) : (
            <XCircle className="h-12 w-12 text-danger" aria-hidden />
         )}
         <div className="space-y-2" role="status">
            <h1 className="text-xl font-semibold tracking-tight">
               {!valid
                  ? 'This link is not valid'
                  : ok
                    ? 'You’re signed in'
                    : 'Sign-in did not complete'}
            </h1>
            <p className="text-sm text-muted-foreground">
               {!valid
                  ? 'Open the login page and try again.'
                  : 'This window will close on its own. You can return to the app.'}
            </p>
         </div>
         {!valid ? (
            <Link href="/login" className="text-sm font-medium underline underline-offset-4">
               Go to log in
            </Link>
         ) : manual ? (
            <Button variant="secondary" onClick={() => window.close()}>
               Close this window
            </Button>
         ) : null}
      </div>
   );
}

export default function OAuthCallbackPage() {
   return (
      <Suspense fallback={null}>
         <CallbackInner />
      </Suspense>
   );
}
