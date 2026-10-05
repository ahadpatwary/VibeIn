import axios from 'axios';
import { API_ERROR_CODES, ApiError, defaultMessageFor, type ApiErrorCode } from './api-error';
import { env } from '../config/env';

/**
 * Shared axios instance for every module.
 *
 * Expected backend error shape:  { "error": { "code": "OTP_INVALID", "message": "..." } }
 * Anything else is mapped from the HTTP status.
 */
let accessTokenProvider: (() => string | null) | null = null;

/** The auth module registers a getter here so this file never imports auth code. */
export function setAccessTokenProvider(provider: (() => string | null) | null) {
   accessTokenProvider = provider;
}

export const http = axios.create({
   baseURL: env.apiUrl,
   withCredentials: true, // refresh token lives in an httpOnly cookie
   timeout: 15_000,
   headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
   const token = accessTokenProvider?.();
   if (token) config.headers.set('Authorization', `Bearer ${token}`);
   return config;
});

function codeFromStatus(status: number): ApiErrorCode {
   if (status === 401) return 'UNAUTHORIZED';
   if (status === 409) return 'EMAIL_TAKEN';
   if (status === 429) return 'RATE_LIMITED';
   if (status === 400 || status === 422) return 'VALIDATION';
   return 'UNKNOWN';
}

function toApiError(error: unknown): ApiError {
   if (error instanceof ApiError) return error;
   if (!axios.isAxiosError(error)) return new ApiError('UNKNOWN');
   if (!error.response) return new ApiError('NETWORK');
   const { status, data } = error.response as { status: number; data?: unknown };
   const payload = (data as { error?: { code?: string; message?: string } } | undefined)?.error;
   const code: ApiErrorCode =
      payload?.code && API_ERROR_CODES.has(payload.code)
         ? (payload.code as ApiErrorCode)
         : codeFromStatus(status);

   return new ApiError(code, payload?.message ?? defaultMessageFor(code), status);
}

http.interceptors.response.use(
   (response) => response,
   (error: unknown) => Promise.reject(toApiError(error)),
);
