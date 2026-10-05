// import {
//    Injectable,
//    ConflictException,
//    UnauthorizedException,
//    BadRequestException,
//    ForbiddenException,
//    NotFoundException,
//    Logger,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { v4 as uuidv4 } from 'uuid';
// import { Request, Response } from 'express';
// import { UsersService } from '../users/users.service';
// import { MailService } from '../mail/mail.service';
// import { TokenService } from './token.service';
// import { OtpService } from './otp.service';
// import { SessionService } from './session.service';
// import { OAuthService } from './oauth.service';
// import { RedisService, KEYS, TTL } from '../redis/redis.service';
// import type { UserPublic } from '../users/user.schema';
// import type {
//    RegisterDto,
//    LoginDto,
//    VerifyOtpDto,
//    ResendOtpDto,
//    CompleteProfileDto,
// } from './dto/auth.dto';

// const REFRESH_COOKIE = 'refresh_token';
// const OTP_ERRORS: Record<string, string> = {
//    NOT_FOUND: 'OTP not found or expired. Please request a new one.',
//    EXPIRED: 'OTP has expired. Please request a new one.',
//    MAX_ATTEMPTS: 'Too many incorrect attempts. Please request a new OTP.',
//    INVALID: 'Invalid OTP. Please check and try again.',
// };

// interface TokenMeta {
//    ip?: string;
//    userAgent?: string;
// }

// @Injectable()
// export class AuthService {
//    private readonly logger = new Logger(AuthService.name);
//    private readonly isProd: boolean;

//    constructor(
//       private readonly users: UsersService,
//       private readonly mail: MailService,
//       private readonly token: TokenService,
//       private readonly otp: OtpService,
//       private readonly session: SessionService,
//       private readonly oauth: OAuthService,
//       private readonly redis: RedisService,
//       private readonly config: ConfigService,
//    ) {
//       this.isProd = config.get<string>('NODE_ENV') === 'production';
//    }

//    // ── Cookie helper ─────────────────────────────────────
//    private setRefreshCookie(res: Response, token: string): void {
//       res.cookie(REFRESH_COOKIE, token, {
//          httpOnly: true,
//          secure: this.isProd,
//          sameSite: 'lax',
//          path: '/',
//          maxAge: TTL.refreshToken * 1000,
//       });
//    }

//    private clearRefreshCookie(res: Response): void {
//       res.clearCookie(REFRESH_COOKIE, { httpOnly: true, path: '/' });
//    }

//    private getMeta(req: Request): TokenMeta {
//       return {
//          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
//          userAgent: req.headers['user-agent'],
//       };
//    }

//    // ── REGISTER ──────────────────────────────────────────
//    async register(dto: RegisterDto): Promise<{ email: string }> {
//       const exists = await this.users.emailExists(dto.email);
//       if (exists) throw new ConflictException('An account with this email already exists');

//       await this.users.create({
//          email: dto.email,
//          name: dto.name,
//          password: dto.password,
//          providers: ['email'],
//          isEmailVerified: false,
//       });

//       const otp = await this.otp.createOtp(dto.email);
//       await this.mail.sendOtp(dto.email, dto.name, otp);

//       return { email: dto.email };
//    }

//    // ── LOGIN ─────────────────────────────────────────────
//    async login(dto: LoginDto): Promise<{ requiresOtp: true; email: string }> {
//       const user = await this.users.findByEmail(dto.email, true);

//       // Generic error — prevent user enumeration
//       if (!user) throw new UnauthorizedException('Invalid email or password');
//       if (!user.isActive) throw new ForbiddenException('Account deactivated');
//       if (user.isLocked()) {
//          const mins = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60000);
//          throw new ForbiddenException(`Account locked. Try again in ${mins} minute(s).`);
//       }
//       if (!user.providers.includes('email')) {
//          throw new BadRequestException(
//             `This account uses ${user.providers[0]} sign-in. Please use that provider.`,
//          );
//       }

//       const valid = await user.comparePassword(dto.password);
//       if (!valid) {
//          await this.users.incrementFailedLogins((user._id as any).toString());
//          const remaining = 5 - (user.failedLoginAttempts + 1);
//          throw new UnauthorizedException(
//             remaining > 0
//                ? `Invalid email or password. ${remaining} attempt(s) remaining.`
//                : 'Invalid email or password. Account locked for 30 minutes.',
//          );
//       }

//       await this.users.resetFailedLogins((user._id as any).toString());

//       // Always send OTP (works as 2FA even after password check)
//       if (!user.isEmailVerified) {
//          const otp = await this.otp.createOtp(dto.email);
//          await this.mail.sendOtp(dto.email, user.name, otp);
//          return { requiresOtp: true, email: dto.email };
//       }

//       const otp = await this.otp.createOtp(dto.email);
//       await this.mail.sendOtp(dto.email, user.name, otp);
//       return { requiresOtp: true, email: dto.email };
//    }

//    // ── VERIFY OTP ────────────────────────────────────────
//    async verifyOtp(
//       dto: VerifyOtpDto,
//       res: Response,
//       req: Request,
//    ): Promise<{ user: UserPublic; accessToken: string }> {
//       const result = await this.otp.verifyOtp(dto.email, dto.otp);
//       if (!result.ok) {
//          throw new BadRequestException(OTP_ERRORS[result.reason] ?? 'Verification failed');
//       }

//       const user = await this.users.findByEmail(dto.email);
//       if (!user) throw new NotFoundException('User not found');
//       if (!user.isActive) throw new ForbiddenException('Account deactivated');

//       const userId = (user._id as any).toString();
//       const firstVerification = !user.isEmailVerified;

//       if (!user.isEmailVerified) {
//          await this.users.markEmailVerified(userId);
//          user.isEmailVerified = true;
//       }

//       const { token: rt, jti: rtJti, family } = this.token.generateRefreshToken(userId);
//       const at = this.token.generateAccessToken({
//          sub: userId,
//          email: user.email,
//          name: user.name,
//       });

//       await Promise.all([
//          this.token.storeRefreshToken(rtJti, userId, family),
//          this.session.create(userId, user.email, user.name, family, this.getMeta(req)),
//          this.users.updateLastLogin(userId),
//       ]);

//       this.setRefreshCookie(res, rt);

//       if (firstVerification) {
//          this.mail
//             .sendWelcome(user.email, user.name)
//             .catch((e) => this.logger.error('Welcome email error:', e));
//       }

//       return { user: user.toPublic(), accessToken: at };
//    }

//    // ── REFRESH ───────────────────────────────────────────
//    async refresh(
//       refreshToken: string | undefined,
//       res: Response,
//       req: Request,
//    ): Promise<{ user: UserPublic; accessToken: string }> {
//       if (!refreshToken) throw new UnauthorizedException('No refresh token');

//       const payload = this.token.verifyRefreshToken(refreshToken);
//       const { sub: userId, jti, family } = payload;

//       const stored = await this.token.getRefreshTokenData(jti);
//       if (!stored) {
//          // Refresh token reuse detected → nuke everything
//          this.logger.warn(`[SECURITY] RT reuse detected for user ${userId}`);
//          await Promise.all([this.session.revokeAll(userId)]);
//          this.clearRefreshCookie(res);
//          throw new UnauthorizedException('Refresh token reuse detected. All sessions revoked.');
//       }

//       const sessionValid = await this.session.validate(userId, family);
//       if (!sessionValid) {
//          await this.token.revokeRefreshToken(jti);
//          this.clearRefreshCookie(res);
//          throw new UnauthorizedException('Session expired. Please log in again.');
//       }

//       const user = await this.users.findById(userId);
//       if (!user || !user.isActive) {
//          await this.session.revokeAll(userId);
//          this.clearRefreshCookie(res);
//          throw new UnauthorizedException('Account not found or deactivated.');
//       }

//       const newRt = await this.token.rotateRefreshToken(jti, userId, family);
//       const at = this.token.generateAccessToken({
//          sub: userId,
//          email: user.email,
//          name: user.name,
//       });

//       await this.session.touch(userId, family);
//       this.setRefreshCookie(res, newRt.token);

//       return { user: user.toPublic(), accessToken: at };
//    }

//    // ── LOGOUT ────────────────────────────────────────────
//    async logout(
//       accessToken: string | undefined,
//       refreshToken: string | undefined,
//       res: Response,
//    ): Promise<void> {
//       if (accessToken) {
//          try {
//             const at = this.token.verifyAccessToken(accessToken);
//             await this.token.blacklistAccessToken(at.jti);
//          } catch {
//             /* already expired */
//          }
//       }

//       if (refreshToken) {
//          try {
//             const rt = this.token.verifyRefreshToken(refreshToken);
//             await Promise.all([
//                this.token.revokeRefreshToken(rt.jti),
//                this.session.revoke(rt.sub, rt.family),
//             ]);
//          } catch {
//             /* already expired */
//          }
//       }

//       this.clearRefreshCookie(res);
//    }

//    // ── RESEND OTP ────────────────────────────────────────
//    async resendOtp(dto: ResendOtpDto): Promise<void> {
//       const cooldown = await this.otp.canResend(dto.email);
//       if (!cooldown.allowed) {
//          throw new BadRequestException(
//             `Please wait ${cooldown.remainingSeconds}s before requesting a new code.`,
//          );
//       }

//       const user = await this.users.findByEmail(dto.email);
//       if (!user || !user.isActive) return; // Silent — prevent enumeration

//       const otp = await this.otp.createOtp(dto.email);
//       await this.otp.setCooldown(dto.email);
//       await this.mail.sendOtp(dto.email, user.name, otp);
//    }

//    // ── REVOKE ALL SESSIONS ───────────────────────────────
//    async revokeAllSessions(
//       userId: string,
//       accessTokenJti: string,
//       refreshToken: string | undefined,
//       res: Response,
//    ): Promise<number> {
//       await this.token.blacklistAccessToken(accessTokenJti);

//       if (refreshToken) {
//          try {
//             const rt = this.token.verifyRefreshToken(refreshToken);
//             await this.token.revokeRefreshToken(rt.jti);
//          } catch {
//             /* expired */
//          }
//       }

//       const count = await this.session.revokeAll(userId);
//       this.clearRefreshCookie(res);
//       return count;
//    }

//    // ── LIST SESSIONS ─────────────────────────────────────
//    async listSessions(userId: string) {
//       return this.session.list(userId);
//    }

//    // ── OAUTH: GOOGLE ─────────────────────────────────────
//    getGoogleUrl(): string {
//       return this.oauth.getGoogleAuthUrl();
//    }

//    async handleGoogleCallback(
//       code: string,
//       res: Response,
//       req: Request,
//    ): Promise<{ redirect: string }> {
//       const profile = await this.oauth.exchangeGoogleCode(code);
//       return this.handleOAuthProfile(profile, res, req);
//    }

//    // ── OAUTH: GITHUB ─────────────────────────────────────
//    getGithubUrl(): string {
//       return this.oauth.getGithubAuthUrl();
//    }

//    async handleGithubCallback(
//       code: string,
//       res: Response,
//       req: Request,
//    ): Promise<{ redirect: string }> {
//       const profile = await this.oauth.exchangeGithubCode(code);
//       return this.handleOAuthProfile(profile, res, req);
//    }

//    // ── Shared OAuth handler ──────────────────────────────
//    private async handleOAuthProfile(
//       profile: Awaited<ReturnType<OAuthService['exchangeGoogleCode']>>,
//       res: Response,
//       req: Request,
//    ): Promise<{ redirect: string }> {
//       const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
//       const providerField = profile.provider === 'google' ? 'googleId' : 'githubId';

//       let user = await this.users.findByProviderOrEmail(profile.id, providerField, profile.email);

//       // No email from provider → save temp state and ask user
//       if (!user && !profile.email) {
//          const tempToken = uuidv4();
//          await this.redis.set(
//             KEYS.tempOAuth(tempToken),
//             {
//                provider: profile.provider,
//                providerId: profile.id,
//                name: profile.name,
//                avatar: profile.avatar,
//             },
//             TTL.tempOAuth,
//          );
//          return {
//             redirect: `${appUrl}/complete-profile?token=${tempToken}&provider=${profile.provider}`,
//          };
//       }

//       if (user) {
//          if (!user.isActive) return { redirect: `${appUrl}/login?error=account_deactivated` };
//          // Link provider if not already linked
//          const field = profile.provider === 'google' ? 'googleId' : 'githubId';
//          if (!user[field]) {
//             await this.users.linkProvider(
//                (user._id as any).toString(),
//                profile.provider,
//                profile.id,
//             );
//          }
//       } else {
//          user = await this.users.create({
//             email: profile.email!,
//             name: profile.name,
//             avatar: profile.avatar,
//             providers: [profile.provider],
//             [providerField]: profile.id,
//             isEmailVerified: true,
//          });
//       }

//       const userId = (user._id as any).toString();
//       const { token: rt, jti: rtJti, family } = this.token.generateRefreshToken(userId);
//       const at = this.token.generateAccessToken({
//          sub: userId,
//          email: user.email,
//          name: user.name,
//       });

//       await Promise.all([
//          this.token.storeRefreshToken(rtJti, userId, family),
//          this.session.create(userId, user.email, user.name, family, this.getMeta(req)),
//          this.users.updateLastLogin(userId),
//       ]);

//       this.setRefreshCookie(res, rt);
//       return { redirect: `${appUrl}/oauth/callback?accessToken=${at}` };
//    }

//    // ── COMPLETE PROFILE (OAuth no-email) ─────────────────
//    async completeProfile(
//       dto: CompleteProfileDto,
//       res: Response,
//       req: Request,
//    ): Promise<{ user: UserPublic; accessToken: string }> {
//       const tempKey = KEYS.tempOAuth(dto.tempToken);
//       const tempData = await this.redis.get<{
//          provider: 'google' | 'github';
//          providerId: string;
//          name: string;
//          avatar?: string;
//       }>(tempKey);

//       if (!tempData) throw new BadRequestException('Session expired. Please sign in again.');

//       const exists = await this.users.emailExists(dto.email);
//       if (exists)
//          throw new ConflictException('This email is already associated with another account.');

//       const providerField = tempData.provider === 'google' ? 'googleId' : 'githubId';
//       const user = await this.users.create({
//          email: dto.email,
//          name: tempData.name,
//          avatar: tempData.avatar,
//          providers: [tempData.provider],
//          [providerField]: tempData.providerId,
//          isEmailVerified: true,
//       });

//       await this.redis.del(tempKey);

//       const userId = (user._id as any).toString();
//       const { token: rt, jti: rtJti, family } = this.token.generateRefreshToken(userId);
//       const at = this.token.generateAccessToken({
//          sub: userId,
//          email: user.email,
//          name: user.name,
//       });

//       await Promise.all([
//          this.token.storeRefreshToken(rtJti, userId, family),
//          this.session.create(userId, user.email, user.name, family, this.getMeta(req)),
//       ]);

//       this.setRefreshCookie(res, rt);
//       return { user: user.toPublic(), accessToken: at };
//    }
// }
