import { v4 as uuidv4 } from 'uuid';
import { AuthProvider, UserStatus } from '@app/db-schemas';
import {
   AccountBlockedError,
   AccountNotFoundError,
   InvalidCredentialsError,
   InvalidVerifyTokenError,
} from '../errors/exception';

import { AUTH_TOKENS } from '../tokens/token';
import {
   type AuthResult,
   type CredentialsLoginInput,
   type CredentialsRegisterInput,
   type LoginResult,
   type ProviderAuthInput,
   type SessionMeta,
} from '../types/type';

import { normalizeEmail } from '../utils/auth.util';
import { OTP_TOKENTS, OtpService } from '@app/otp';
import { UseCaseRepository } from '../../infrastructure/repository/use-case.repository';
import { Inject, Injectable } from '@nestjs/common';
import { PASS_HASHER_TOKEN } from '../../infrastructure/hasher/tokens/token';
import { PasswordHasher } from '../../infrastructure/hasher/services/hasher.service';
import { AuthIdentityRepository } from '../../infrastructure/repository/auth.repository';
import { OtpPurpose } from '../../presentation/constants/constant';
import { SESSION_TOKEN } from '../../infrastructure/session/tokens/token';
import { SessionService } from '../../infrastructure/session/services/session.service';
import { JWT_TOKENS } from '../../infrastructure/jwt/tokens/token';
import { TokenService } from '../../infrastructure/jwt/jwt.auth';
import { UserRecord } from '../../../user/application/types/user.type';
import { RevokeReason, SessionStatus } from '../../infrastructure/session/constants/constant';

@Injectable()
export class AuthService {
   constructor(
      @Inject(AUTH_TOKENS.AuthRepository)
      private readonly authrepo: AuthIdentityRepository,

      @Inject(AUTH_TOKENS.UseCaseRepository)
      private readonly useCaseRepo: UseCaseRepository,

      @Inject(OTP_TOKENTS.storeService)
      private readonly otpService: OtpService,

      @Inject(PASS_HASHER_TOKEN.PassHasherService)
      private readonly passHasherService: PasswordHasher,

      @Inject(SESSION_TOKEN.SessionService)
      private readonly sessionService: SessionService,

      @Inject(JWT_TOKENS.TokenService)
      private readonly tokenService: TokenService,
   ) {}

   async registerWithCredentials(input: CredentialsRegisterInput): Promise<void> {
      const valid = await this.otpService.consumeVerifyToken(
         input.email,
         input.verifyToken,
         OtpPurpose.REGISTER,
      );

      if (!valid) throw new InvalidVerifyTokenError();

      const passwordHash = await this.passHasherService.hash(input.password);

      const user = await this.useCaseRepo.registerWithCredentials(input.user, passwordHash);

      this.assertActive(user.status);

      //assign others access token, refresh token, session.
   }

   async registerWithProvider(input: ProviderAuthInput): Promise<AuthResult> {
      const user = await this.useCaseRepo.registerWithProvider(input);

      this.assertActive(user.status);

      return this.issueSession(user, input.meta);
   }

   async loginWithProvider(input: ProviderAuthInput): Promise<AuthResult> {
      const user = await this.useCaseRepo.loginWithProvider(input);
      if (!user) throw new AccountNotFoundError();

      this.assertActive(user.status);
      return this.issueSession(user, input.meta);
   }

   async loginWithCredentials(input: CredentialsLoginInput): Promise<LoginResult> {
      const email = normalizeEmail(input.email);

      const user = await this.useCaseRepo.findUserByEmail(email);

      const identity = await this.authrepo.findByUserAndProvider(
         user._id,
         AuthProvider.Credentials,
      );

      const passwordOk = await this.passHasherService.verify(
         identity?.passwordHash,
         input.password,
      );
      if (!passwordOk) {
         // await this.attempts.recordFailure(email);
         throw new InvalidCredentialsError();
      }

      this.assertActive(user.status);
      // await this.attempts.reset(email);

      // if (user.twoFactorEnabled) {
      //    const challengeToken = await this.challenges.create({
      //       userId: user._id.toString(),
      //       email,
      //       deviceId: input.meta.deviceId,
      //    });
      //    const otp = await this.otp.sendOtp(OtpPurpose.LOGIN, input.meta.deviceId, email);
      //    return { status: 'otp_required', challengeToken, otp };
      // }

      // await this.identities.touchLastLogin(user._id, AuthProvider.Credentials);
      return { status: 'authenticated', ...(await this.issueSession(user, input.meta)) };
   }

   async logout(sessionId: string, userId: string): Promise<void> {
      await this.sessionService.revokeSession(sessionId, userId, RevokeReason.USER_LOGOUT);
   }

   async logoutAll(userId: string, reason: RevokeReason): Promise<void> {
      await this.sessionService.revokeAllSessions(userId, reason);
   }

   private assertActive(status: UserStatus): void {
      if (status !== UserStatus.ACTIVE) throw new AccountBlockedError();
   }

   private async issueSession(user: UserRecord, meta: SessionMeta): Promise<AuthResult> {
      const userId = user._id.toString();

      const sessionId = uuidv4();

      const accessToken = this.tokenService.generateAccessToken({
         sub: userId,
         deviceId: meta.deviceId,
         sid: sessionId,
         email: user.email,
         jti: 'jti',
         name: user.fullName,
         role: user.roles,
      });

      const refreshToken = this.tokenService.generateRefreshToken({
         sub: userId,
         deviceId: meta.deviceId,
         jti: 'jti',
         sid: sessionId,
         role: user.roles,
      });

      await this.sessionService.createSession({
         sessionId: sessionId,
         deviceId: meta.deviceId,
         userId: userId,
         email: user.email,
         refreshToken: refreshToken,
         status: SessionStatus.ACTIVE,
         browser: meta?.userAgent,
         ip: meta?.ip,
      });

      return { user: user, tokens: { accessToken, refreshToken } };
   }
}
