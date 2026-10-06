import { IUser } from '@app/contracts';
import type { AuthProvider, IAuthIdentity, UserRole } from '@app/db-schemas';
import type { OtpSendResult, OtpService } from '@app/otp';
import type { Types } from 'mongoose';

export type IdentityRecord = IAuthIdentity & { _id: Types.ObjectId };
export type CreateAuthType = Omit<IAuthIdentity, 'createdAt' | 'updatedAt'>;

export type OtpPort = Pick<OtpService, 'sendOtp' | 'verifyOtp' | 'consumeVerifyToken'>;

export interface AccessTokenSigner {
   sign(payload: { sub: string; sid: string; roles: UserRole[] }): Promise<string>;
}

export interface SessionMeta {
   deviceId: string;
   ip?: string;
   userAgent?: string;
}

export interface AuthTokens {
   accessToken: string;
   refreshToken: string;
}

export interface AuthResult {
   user: IUser;
   tokens: AuthTokens;
}

export type LoginResult =
   | ({ status: 'authenticated' } & AuthResult)
   | { status: 'otp_required'; challengeToken: string; otp: OtpSendResult };

export interface CredentialsRegisterInput {
   email: string;
   password: string;
   verifyToken: string;
   user: IUser;
   meta: SessionMeta;
}

export interface CredentialsLoginInput {
   email: string;
   password: string;
   meta: SessionMeta;
}

export interface VerifyLoginOtpInput {
   challengeToken: string;
   otp: string;
   meta: Omit<SessionMeta, 'deviceId'>;
}

export interface ProviderAuthInput {
   provider: AuthProvider.Github | AuthProvider.Google;
   providerId: string;
   email: string;
   user: IUser;
   meta: SessionMeta;
}

export interface ResetPasswordInput {
   email: string;
   token: string;
   newPassword: string;
}
