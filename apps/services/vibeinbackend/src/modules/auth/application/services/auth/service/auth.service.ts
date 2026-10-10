import { v4 as uuidv4 } from 'uuid';
import { AuthProvider, UserStatus } from '@app/db-schemas';

import type {
   AuthResult,
   CredentialsLoginInput,
   CredentialsRegisterInput,
   LoginResult,
   ProviderAuthInput,
} from '../types/type';

import { Types } from 'mongoose';
import { OtpPurpose, UserResponseType } from '@app/contracts';
import { Inject, Injectable } from '@nestjs/common';
import { AUTH_TOKENS } from '../tokens/token';
import { UseCaseRepository } from '../infrastructure/use-case.repository';
import { OTP_TOKENTS, OtpService } from '@app/otp';
import { PASS_HASHER_TOKEN, PasswordHasher } from '../../hasher';
import { RevokeReason, SESSION_TOKEN, SessionService, SessionStatus } from '../../session';
import { JWT_TOKENS, TokenService } from '../../jwt';
import { REQUEST_CONTEXT } from '../../../../../../shared/request-context/request-context.token';
import { RequestContextService } from '../../../../../../shared/request-context/request-context.service';
import {
   AccountBlockedError,
   AccountNotFoundError,
   InvalidCredentialsError,
   InvalidVerifyTokenError,
} from '../errors/exception';
import { normalizeEmail } from '../utils/auth.util';
import { AuthIdentityRepository } from '../infrastructure/auth.repository';

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

      @Inject(REQUEST_CONTEXT)
      private readonly contextService: RequestContextService,
   ) {}

   async registerWithCredentials(input: CredentialsRegisterInput): Promise<AuthResult> {
      const valid = await this.otpService.consumeVerifyToken(
         input.email,
         input.verifyToken,
         OtpPurpose.REGISTER,
      );

      if (!valid) throw new InvalidVerifyTokenError();

      const passwordHash = await this.passHasherService.hash(input.password);

      const user = await this.useCaseRepo.registerWithCredentials(
         {
            email: input.email,
         },
         passwordHash,
      );

      this.assertActive(user.status);

      //assign others access token, refresh token, session.
      return await this.issueSession(user);
   }

   async registerWithProvider(input: ProviderAuthInput): Promise<AuthResult> {
      const user = await this.useCaseRepo.registerWithProvider(input);

      this.assertActive(user.status);

      return await this.issueSession(user);
   }

   async loginWithCredentials(input: CredentialsLoginInput): Promise<LoginResult> {
      const email = normalizeEmail(input.email);

      const user = await this.useCaseRepo.findUserByEmail(email);

      const identity = await this.authrepo.findByUserAndProvider(
         user._id as Types.ObjectId,
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
      return { status: 'authenticated', ...(await this.issueSession(user)) };
   }

   async loginWithProvider(input: ProviderAuthInput): Promise<AuthResult> {
      const user = await this.useCaseRepo.loginWithProvider(input);
      if (!user) throw new AccountNotFoundError();

      this.assertActive(user.status);
      return await this.issueSession(user);
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

   private async issueSession(user: UserResponseType): Promise<AuthResult> {
      const userId = (user._id as Types.ObjectId).toString();

      const sessionId = uuidv4();
      const context = this.contextService.get();
      const uniqueToken = uuidv4();

      const accessToken = this.tokenService.generateAccessToken({
         sub: userId,
         deviceId: context.deviceId,
         sid: sessionId,
         email: user.email,
         jti: uniqueToken,
         name: user.fullName,
         role: user.roles,
      });

      const refreshToken = this.tokenService.generateRefreshToken({
         sub: userId,
         deviceId: context.deviceId,
         jti: uniqueToken,
         sid: sessionId,
         role: user.roles,
      });

      await this.sessionService.createSession({
         sessionId: sessionId,
         deviceId: context.deviceId,
         userId: userId,
         email: user.email,
         refreshToken: refreshToken,
         status: SessionStatus.ACTIVE,
         browser: context?.userAgent,
         ip: context?.ip,
      });

      return { user: user, tokens: { accessToken, refreshToken } };
   }
}
