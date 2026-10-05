'use client';

import { useMutation } from '@tanstack/react-query';
import type { ApiError } from '@/lib/api-error';
import { authApi } from '../services';
import type { AuthSession, OtpChallenge, OtpPurpose, OtpTicket } from '../types';

export function useRequestOtp(purpose: OtpPurpose) {
   return useMutation<OtpChallenge, ApiError, { email: string }>({
      mutationFn: (input) =>
         purpose === 'register'
            ? authApi.requestRegistrationOtp(input)
            : authApi.requestPasswordResetOtp(input),
   });
}

export function useVerifyOtp() {
   return useMutation<OtpTicket, ApiError, { email: string; otp: string; purpose: OtpPurpose }>({
      mutationFn: (input) => authApi.verifyOtp(input),
   });
}

export function useCompleteRegistration() {
   return useMutation<AuthSession, ApiError, { ticket: string; password: string }>({
      mutationFn: (input) => authApi.completeRegistration(input),
   });
}

export function useLogin() {
   return useMutation<AuthSession, ApiError, { email: string; password: string }>({
      mutationFn: (input) => authApi.login(input),
   });
}

export function useLoginWithTicket() {
   return useMutation<AuthSession, ApiError, { ticket: string }>({
      mutationFn: (input) => authApi.loginWithTicket(input),
   });
}

export function useResetPassword() {
   return useMutation<AuthSession, ApiError, { ticket: string; password: string }>({
      mutationFn: (input) => authApi.resetPassword(input),
   });
}

/** After the OAuth popup succeeds, the refresh cookie is set — exchange it for an access token. */
export function useOAuthSession() {
   return useMutation<AuthSession, ApiError, void>({
      mutationFn: () => authApi.refreshSession(),
   });
}
