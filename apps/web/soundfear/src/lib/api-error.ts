export type ApiErrorCode =
   | 'INVALID_CREDENTIALS'
   | 'EMAIL_TAKEN'
   | 'OTP_INVALID'
   | 'OTP_EXPIRED'
   | 'RATE_LIMITED'
   | 'VALIDATION'
   | 'UNAUTHORIZED'
   | 'NETWORK'
   | 'POPUP_BLOCKED'
   | 'OAUTH_FAILED'
   | 'UNKNOWN';

export const API_ERROR_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
   'INVALID_CREDENTIALS',
   'EMAIL_TAKEN',
   'OTP_INVALID',
   'OTP_EXPIRED',
   'RATE_LIMITED',
   'VALIDATION',
   'UNAUTHORIZED',
   'NETWORK',
   'POPUP_BLOCKED',
   'OAUTH_FAILED',
   'UNKNOWN',
]);

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
   INVALID_CREDENTIALS: 'Incorrect email or password.',
   EMAIL_TAKEN: 'An account with this email already exists. Try logging in instead.',
   OTP_INVALID: 'That code is not correct. Check it and try again.',
   OTP_EXPIRED: 'That code has expired. Request a new one.',
   RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
   VALIDATION: 'Some of the information provided is not valid.',
   UNAUTHORIZED: 'Your session has ended. Please log in again.',
   NETWORK: 'Cannot reach the server. Check your connection and try again.',
   POPUP_BLOCKED:
      'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
   OAUTH_FAILED: 'Sign-in failed. Please try again.',
   UNKNOWN: 'Something went wrong. Please try again.',
};

export class ApiError extends Error {
   readonly code: ApiErrorCode;
   readonly status?: number;

   constructor(code: ApiErrorCode, message?: string, status?: number) {
      super(message ?? DEFAULT_MESSAGES[code]);
      this.name = 'ApiError';
      this.code = code;
      this.status = status;
   }
}

/** Safe, user-presentable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
   if (error instanceof ApiError) return error.message;
   return DEFAULT_MESSAGES.UNKNOWN;
}

export function defaultMessageFor(code: ApiErrorCode): string {
   return DEFAULT_MESSAGES[code];
}
