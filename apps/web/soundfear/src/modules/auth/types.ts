export type OAuthProvider = 'google' | 'github';

export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ['google', 'github'];

export type OtpPurpose = 'register' | 'reset-password';

export interface AuthUser {
   id: string;
   email: string;
   name?: string | null;
   avatarUrl?: string | null;
}

/** The access token is kept in memory only (never localStorage). */
export interface AuthSession {
   user: AuthUser;
   accessToken: string;
}

export interface OtpChallenge {
   /** How long the code stays valid. */
   expiresInSeconds: number;
   /** How long before another code may be requested. */
   resendAfterSeconds: number;
}

export interface OtpTicket {
   /** Short-lived proof that the OTP was verified. Exchanged in the next step. */
   ticket: string;
}
