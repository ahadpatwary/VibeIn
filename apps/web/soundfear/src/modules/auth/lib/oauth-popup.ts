import { env } from '@/config/env';
import { ApiError, defaultMessageFor } from '@/lib/api-error';
import { OAUTH_PROVIDERS, type OAuthProvider } from '../types';

/** Same-origin channel the popup uses to report back to the main window. */
export const OAUTH_CHANNEL = 'soundfear-auth';
export const OAUTH_MESSAGE_SOURCE = 'soundfear-auth';

export interface OAuthResultMessage {
   source: typeof OAUTH_MESSAGE_SOURCE;
   type: 'oauth-result';
   popupId: string;
   provider: OAuthProvider | null;
   status: 'success' | 'error';
   error?: string;
}

export function isOAuthProvider(value: unknown): value is OAuthProvider {
   return typeof value === 'string' && (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

export function parseOAuthMessage(data: unknown): OAuthResultMessage | null {
   if (typeof data !== 'object' || data === null) return null;
   const m = data as Partial<OAuthResultMessage>;
   if (m.source !== OAUTH_MESSAGE_SOURCE || m.type !== 'oauth-result') return null;
   if (typeof m.popupId !== 'string' || (m.status !== 'success' && m.status !== 'error'))
      return null;
   return {
      source: OAUTH_MESSAGE_SOURCE,
      type: 'oauth-result',
      popupId: m.popupId,
      provider: isOAuthProvider(m.provider) ? m.provider : null,
      status: m.status,
      error: typeof m.error === 'string' ? m.error : undefined,
   };
}

/**
 * URL opened inside the popup.
 * Real mode: the backend starts the provider flow, and when finished redirects the popup to
 *   /auth/callback?status=success|error&popup_id=<echoed>&provider=<provider>[&error=<code>]
 */
export function buildOAuthUrl(provider: OAuthProvider, popupId: string): string {
   if (env.authMock) {
      return `/auth/mock-provider?provider=${provider}&popup_id=${encodeURIComponent(popupId)}`;
   }
   const base = env.apiUrl.replace(/\/$/, '');
   return `${base}/auth/oauth/${provider}?mode=popup&popup_id=${encodeURIComponent(popupId)}`;
}

export function openOAuthPopup(url: string): Window | null {
   const width = 520;
   const height = 700;
   const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
   const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
   const features = `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
   return window.open(url, 'soundfear-oauth', features);
}

/** Called from the callback page running inside the popup. */
export function publishOAuthResult(message: OAuthResultMessage): void {
   try {
      if (typeof BroadcastChannel !== 'undefined') {
         const channel = new BroadcastChannel(OAUTH_CHANNEL);
         channel.postMessage(message);
         channel.close();
      }
   } catch {
      /* fall through to postMessage */
   }
   try {
      window.opener?.postMessage(message, window.location.origin);
   } catch {
      /* opener may have been severed by the provider's COOP header */
   }
}

export function oauthErrorToApiError(
   code: string | undefined,
   provider: OAuthProvider | null,
): ApiError | null {
   if (code === 'access_denied') return null; // user pressed Cancel — not an error worth showing
   const name =
      provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : 'the provider';
   if (code === 'email_unverified') {
      return new ApiError(
         'OAUTH_FAILED',
         `Your ${name} email is not verified. Verify it with ${name} and try again.`,
      );
   }
   return new ApiError('OAUTH_FAILED', `${defaultMessageFor('OAUTH_FAILED')} (${name})`);
}
