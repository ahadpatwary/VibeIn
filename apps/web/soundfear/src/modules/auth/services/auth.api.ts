import type { AuthSession, OtpChallenge, OtpPurpose, OtpTicket } from '../types';

/**
 * Contract between the auth frontend and the backend.
 * Implemented twice: `auth.http.ts` (real) and `auth.mock.ts` (fake, for UI work).
 */
export interface AuthApi {
   requestRegistrationOtp(input: { email: string }): Promise<OtpChallenge>;
   requestPasswordResetOtp(input: { email: string }): Promise<OtpChallenge>;
   verifyOtp(input: { email: string; otp: string; purpose: OtpPurpose }): Promise<OtpTicket>;
   completeRegistration(input: { ticket: string; password: string }): Promise<AuthSession>;
   login(input: { email: string; password: string }): Promise<AuthSession>;
   /** "Skip" on the change-password step: the verified OTP is enough to sign in. */
   loginWithTicket(input: { ticket: string }): Promise<AuthSession>;
   resetPassword(input: { ticket: string; password: string }): Promise<AuthSession>;
   /** Uses the httpOnly refresh cookie to mint a new access token (also used after OAuth). */
   refreshSession(): Promise<AuthSession>;
   logout(): Promise<void>;
}
