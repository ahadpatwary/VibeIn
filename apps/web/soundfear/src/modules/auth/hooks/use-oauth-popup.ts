'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api-error';
import { uid } from '@/lib/uid';
import {
   OAUTH_CHANNEL,
   buildOAuthUrl,
   oauthErrorToApiError,
   openOAuthPopup,
   parseOAuthMessage,
} from '../lib/oauth-popup';
import type { OAuthProvider } from '../types';

const POLL_MS = 500;
/** Grace period for a result to arrive after the popup window disappears. */
const CLOSE_GRACE_MS = 1000;
/** A late success is still accepted for this long (covers COOP-severed popups). */
const ACCEPT_WINDOW_MS = 5 * 60 * 1000;

interface Options {
   onSuccess: (provider: OAuthProvider | null) => void;
   onError: (error: ApiError) => void;
}

/**
 * Runs provider login/registration in a popup so the main app never reloads.
 * The popup lands on /auth/callback which reports the result through a same-origin
 * BroadcastChannel (and window.opener.postMessage as a fallback), then closes itself.
 */
export function useOAuthPopup({ onSuccess, onError }: Options) {
   const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);

   const popupRef = useRef<Window | null>(null);
   const activeIdRef = useRef<string | null>(null);
   const pollRef = useRef<number | null>(null);
   const expiryRef = useRef<number | null>(null);
   const handlersRef = useRef({ onSuccess, onError });

   useEffect(() => {
      handlersRef.current = { onSuccess, onError };
   });

   const stopPolling = useCallback(() => {
      if (pollRef.current !== null) window.clearInterval(pollRef.current);
      if (expiryRef.current !== null) window.clearTimeout(expiryRef.current);
      pollRef.current = null;
      expiryRef.current = null;
   }, []);

   const finish = useCallback(() => {
      stopPolling();
      activeIdRef.current = null;
      popupRef.current = null;
      setPendingProvider(null);
   }, [stopPolling]);

   useEffect(() => {
      const handle = (data: unknown) => {
         const message = parseOAuthMessage(data);
         if (!message || message.popupId !== activeIdRef.current) return;

         try {
            popupRef.current?.close();
         } catch {
            /* cross-origin handle — nothing to do */
         }
         finish();

         if (message.status === 'success') {
            handlersRef.current.onSuccess(message.provider);
            return;
         }
         const error = oauthErrorToApiError(message.error, message.provider);
         if (error) handlersRef.current.onError(error);
      };

      const channel =
         typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(OAUTH_CHANNEL) : null;
      channel?.addEventListener('message', (event: MessageEvent) => handle(event.data));

      const onWindowMessage = (event: MessageEvent) => {
         if (event.origin !== window.location.origin) return;
         handle(event.data);
      };
      window.addEventListener('message', onWindowMessage);

      return () => {
         channel?.close();
         window.removeEventListener('message', onWindowMessage);
         stopPolling();
      };
   }, [finish, stopPolling]);

   const start = useCallback(
      (provider: OAuthProvider) => {
         // Already open? Bring it to the front instead of opening a second one.
         if (popupRef.current && !popupRef.current.closed) {
            popupRef.current.focus();
            return;
         }

         const popupId = uid();
         const popup = openOAuthPopup(buildOAuthUrl(provider, popupId));
         if (!popup) {
            handlersRef.current.onError(new ApiError('POPUP_BLOCKED'));
            return;
         }

         popupRef.current = popup;
         activeIdRef.current = popupId;
         setPendingProvider(provider);

         let closedAt: number | null = null;
         pollRef.current = window.setInterval(() => {
            if (!popupRef.current?.closed) {
               closedAt = null;
               return;
            }
            closedAt ??= Date.now();
            if (Date.now() - closedAt > CLOSE_GRACE_MS) {
               // Popup is gone with no result: the user cancelled. Reset the UI but keep
               // accepting a late success message until the accept window ends.
               if (pollRef.current !== null) window.clearInterval(pollRef.current);
               pollRef.current = null;
               setPendingProvider(null);
            }
         }, POLL_MS);

         expiryRef.current = window.setTimeout(finish, ACCEPT_WINDOW_MS);
      },
      [finish],
   );

   const cancel = useCallback(() => {
      try {
         popupRef.current?.close();
      } catch {
         /* ignore */
      }
      finish();
   }, [finish]);

   return { start, cancel, pendingProvider };
}
