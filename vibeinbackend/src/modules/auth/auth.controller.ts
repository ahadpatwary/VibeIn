import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Redirect,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { Public, CurrentUser, Cookie } from './decorators/auth.decorators';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResendOtpDto,
  CompleteProfileDto,
} from './dto/auth.dto';
import type { AccessTokenPayload } from './token.service';

@Controller('auth')
@UseGuards(CustomThrottlerGuard, JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //---- POST /api/auth/accountExist
  @Public()
  @Post('accountExist')
  @Throttle({ default: { ttl: 3_600_000, limit: 10}})
  async accountExist(@Body() dto: EmailExistDto) {
    const exist = await this.authService.accountExist(dto);
    return {
        message: exist ? "account exist" : "account not exist",
        exist: exist
    }
  }

    // ── POST /api/auth/verify-otp ─────────────────────────
  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300_000, limit: 10 } })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.verifyOtp(dto, res, req);
    return { message: 'Login successful', data };
  }

  

  // ── POST /api/auth/register ───────────────────────────
  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 3_600_000, limit: 10 } })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return {
      message: 'Registration successful. Check your email for the verification code.',
      data,
    };
  }

  // ── POST /api/auth/login ──────────────────────────────
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 900_000, limit: 10 } })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return {
      message: 'OTP sent to your email. Please verify to complete login.',
      data,
    };
  }



  // ── POST /api/auth/resend-otp ─────────────────────────
  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 3_600_000, limit: 5 } })
  async resendOtp(@Body() dto: ResendOtpDto) {
    await this.authService.resendOtp(dto);
    return {
      message:
        'If this email is registered, a new verification code has been sent.',
    };
  }

  // ── POST /api/auth/refresh ────────────────────────────
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookie('refresh_token') refreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.refresh(refreshToken, res, req);
    return { message: 'Token refreshed', data };
  }

  // ── POST /api/auth/logout ─────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookie('refresh_token') refreshToken: string | undefined,
  ) {
    const at = req.headers.authorization?.slice(7);
    await this.authService.logout(at, refreshToken, res);
    return { message: 'Logged out successfully' };
  }

  // ── POST /api/auth/complete-profile ──────────────────
  @Public()
  @Post('complete-profile')
  @HttpCode(HttpStatus.CREATED)
  async completeProfile(
    @Body() dto: CompleteProfileDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const data = await this.authService.completeProfile(dto, res, req);
    return { message: 'Profile completed', data };
  }

  // ── GET /api/auth/me ──────────────────────────────────
  @Get('me')
  async getMe(@CurrentUser() user: AccessTokenPayload) {
    return { data: { user } };
  }

  // ── GET /api/auth/sessions ────────────────────────────
  @Get('sessions')
  async listSessions(@CurrentUser() user: AccessTokenPayload) {
    const sessions = await this.authService.listSessions(user.sub);
    return { data: { sessions } };
  }

  // ── DELETE /api/auth/sessions ─────────────────────────
  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(
    @CurrentUser() user: AccessTokenPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Cookie('refresh_token') refreshToken: string | undefined,
  ) {
    const count = await this.authService.revokeAllSessions(
      user.sub,
      user.jti,
      refreshToken,
      res,
    );
    return { message: `${count} session(s) revoked. All devices logged out.` };
  }

  // ── GET /api/auth/oauth/google ────────────────────────
  @Public()
  @Get('oauth/google')
  googleLogin(@Res() res: Response) {
    return res.redirect(this.authService.getGoogleUrl());
  }

  // ── GET /api/auth/oauth/google/callback ───────────────
  @Public()
  @Get('oauth/google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    if (error || !code) {
      return res.redirect(`${appUrl}/login?error=oauth_failed`);
    }
    try {
      const { redirect } = await this.authService.handleGoogleCallback(code, res, req);
      return res.redirect(redirect);
    } catch {
      return res.redirect(`${appUrl}/login?error=oauth_failed`);
    }
  }

  // ── GET /api/auth/oauth/github ────────────────────────
  @Public()
  @Get('oauth/github')
  githubLogin(@Res() res: Response) {
    return res.redirect(this.authService.getGithubUrl());
  }

  // ── GET /api/auth/oauth/github/callback ───────────────
  @Public()
  @Get('oauth/github/callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    if (error || !code) {
      return res.redirect(`${appUrl}/login?error=oauth_failed`);
    }
    try {
      const { redirect } = await this.authService.handleGithubCallback(code, res, req);
      return res.redirect(redirect);
    } catch {
      return res.redirect(`${appUrl}/login?error=oauth_failed`);
    }
  }
}
