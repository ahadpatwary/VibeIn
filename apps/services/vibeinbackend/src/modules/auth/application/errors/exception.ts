import { AppError, AppErrorOptions } from '../../../../shared/errors/app-error';

export abstract class AuthError extends AppError {
   protected constructor(options: AppErrorOptions) {
      super(options);
   }
}

/**
 * Creates a concrete AuthError class with a fixed
 * error code and message.
 */
const defineAuthError = (
   code: string,
   message: string,
   details?: unknown,
   statusCode?: number,
): new () => AuthError => {
   return class extends AuthError {
      constructor() {
         super({ code, message, details, statusCode });
      }
   };
};

export class InvalidCredentialsError extends defineAuthError(
   'INVALID_CREDENTIALS',
   'Invalid credentials',
) {}

export class AccountNotFoundError extends defineAuthError(
   'ACCOUNT_NOT_FOUND',
   'Account not found, please register',
) {}

export class AccountBlockedError extends defineAuthError(
   'ACCOUNT_BLOCKED',
   'Account is not active',
) {}

export class EmailAlreadyRegisteredError extends defineAuthError(
   'EMAIL_ALREADY_REGISTERED',
   'Email already registered',
) {}

export class InvalidVerifyTokenError extends defineAuthError(
   'INVALID_VERIFY_TOKEN',
   'Invalid or expired token',
) {}

export class InvalidOtpError extends defineAuthError('INVALID_OTP', 'Invalid or expired OTP') {}

export class InvalidChallengeError extends defineAuthError(
   'INVALID_CHALLENGE',
   'Invalid or expired login challenge',
) {}

export class InvalidRefreshTokenError extends defineAuthError(
   'INVALID_REFRESH_TOKEN',
   'Invalid refresh token',
) {}

export class RefreshTokenReusedError extends defineAuthError(
   'REFRESH_TOKEN_REUSED',
   'Refresh token reuse detected',
) {}

export class InvalidSessionError extends defineAuthError(
   'INVALID_SESSION',
   'Session is no longer valid',
) {}

export class TooManyAttemptsError extends defineAuthError(
   'TOO_MANY_ATTEMPTS',
   'Too many failed attempts, try later',
) {}

export class ProviderEmailNotVerifiedError extends defineAuthError(
   'PROVIDER_EMAIL_NOT_VERIFIED',
   'Provider email is not verified',
) {}

export const AUTH_ERROR_CODE = {
   INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
   ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
   ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
   EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
   INVALID_VERIFY_TOKEN: 'INVALID_VERIFY_TOKEN',
   INVALID_OTP: 'INVALID_OTP',
   INVALID_CHALLENGE: 'INVALID_CHALLENGE',
   INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
   REFRESH_TOKEN_REUSED: 'REFRESH_TOKEN_REUSED',
   INVALID_SESSION: 'INVALID_SESSION',
   TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
   PROVIDER_EMAIL_NOT_VERIFIED: 'PROVIDER_EMAIL_NOT_VERIFIED',
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODE)[keyof typeof AUTH_ERROR_CODE];
