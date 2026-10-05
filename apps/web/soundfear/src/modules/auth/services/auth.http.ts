import { http } from '@/lib/http';
import type { AuthApi } from './auth.api';
import type { AuthSession, OtpChallenge, OtpTicket } from '../types';

export const httpAuthApi: AuthApi = {
   async requestRegistrationOtp(input) {
      const { data } = await http.post<OtpChallenge>('/auth/register/request-otp', input);
      return data;
   },

   async requestPasswordResetOtp(input) {
      const { data } = await http.post<OtpChallenge>('/auth/password/request-otp', input);
      return data;
   },

   async verifyOtp(input) {
      const { data } = await http.post<OtpTicket>('/auth/otp/verify', input);
      return data;
   },

   async completeRegistration(input) {
      const { data } = await http.post<AuthSession>('/auth/register/complete', input);
      return data;
   },

   async login(input) {
      const { data } = await http.post<AuthSession>('/auth/login', input);
      return data;
   },

   async loginWithTicket(input) {
      const { data } = await http.post<AuthSession>('/auth/login/ticket', input);
      return data;
   },

   async resetPassword(input) {
      const { data } = await http.post<AuthSession>('/auth/password/reset', input);
      return data;
   },

   async refreshSession() {
      const { data } = await http.post<AuthSession>('/auth/refresh');
      return data;
   },

   async logout() {
      await http.post('/auth/logout');
   },
};
