export const AUTH_COOKIE_NAMES = {
   ACCESS_TOKEN: 'access_token',
   REFRESH_TOKEN: 'refresh_token',
} as const;

export type AuthCookieName = (typeof AUTH_COOKIE_NAMES)[keyof typeof AUTH_COOKIE_NAMES];
