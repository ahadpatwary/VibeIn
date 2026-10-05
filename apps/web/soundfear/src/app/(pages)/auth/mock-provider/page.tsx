'use client';

import { Suspense } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { env } from '@/config/env';
import { isOAuthProvider } from '@/modules/auth/lib/oauth-popup';
import { mockSignInWithProvider } from '@/modules/auth/services/auth.mock';
import { GitHubIcon, GoogleIcon } from '@/shared/components/icons';
import { Button } from '@/shared/components/ui/button';

/**
 * Stand-in for the Google / GitHub consent screen. Only exists in demo mode
 * (NEXT_PUBLIC_AUTH_MOCK=true); in real mode the popup goes to the backend instead.
 */
function MockProviderInner() {
   const router = useRouter();
   const params = useSearchParams();
   const provider = params.get('provider');
   const popupId = params.get('popup_id');

   if (!env.authMock || !isOAuthProvider(provider) || !popupId) notFound();

   const name = provider === 'google' ? 'Google' : 'GitHub';
   const Icon = provider === 'google' ? GoogleIcon : GitHubIcon;
   const base = `/auth/callback?provider=${provider}&popup_id=${encodeURIComponent(popupId)}`;

   return (
      <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
         <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-surface">
            <Icon className="h-7 w-7" />
         </div>
         <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">Continue with {name}</h1>
            <p className="text-sm text-muted-foreground">
               This is a simulated {name} screen for testing the pop-up flow. No real account is
               used.
            </p>
         </div>
         <div className="flex w-full flex-col gap-3">
            <Button
               fullWidth
               onClick={() => {
                  mockSignInWithProvider(provider);
                  router.replace(`${base}&status=success`);
               }}
            >
               Continue as demo {name} user
            </Button>
            <Button
               variant="ghost"
               fullWidth
               onClick={() => router.replace(`${base}&status=error&error=access_denied`)}
            >
               Cancel
            </Button>
         </div>
      </div>
   );
}

export default function MockProviderPage() {
   return (
      <Suspense fallback={null}>
         <MockProviderInner />
      </Suspense>
   );
}
