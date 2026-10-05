import { siteConfig } from '@/config/site';

/** Only allow same-site relative paths — blocks open-redirect via ?next=https://evil.com */
export function getSafeRedirect(
   next: string | null | undefined,
   fallback: string = siteConfig.auth.defaultRedirect,
): string {
   if (!next) return fallback;
   if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
   return next;
}

/** Page `searchParams` values can be string | string[] | undefined. */
export function firstParam(value: string | string[] | undefined): string | undefined {
   return Array.isArray(value) ? value[0] : value;
}

/** Link between auth pages that keeps the ?next= redirect target. */
export function authLink(path: '/login' | '/register', next?: string): string {
   return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
