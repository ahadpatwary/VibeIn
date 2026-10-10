import { OTP_TOKENTS, OtpSendResult, OtpService } from '@app/otp';
import {
   BadRequestException,
   Body,
   Controller,
   Get,
   Inject,
   Param,
   Post,
   Query,
   Res,
} from '@nestjs/common';

import type { Response } from 'express';

import {
   type CooldownQuery,
   cooldownQuerySchema,
   // type PasswordResetInput,
   // passwordResetSchema,
   type SendOtpInput,
   sendOtpSchema,
   type VerifyOtpInput,
   verifyOtpSchema,
} from '../schema';
import { OtpPurpose } from '../constants/constant';
import { ZodValidationPipe } from '../../../user/application/pipes/zodValidation.pipe';
import { COOKIE_TOKEN } from '../../application/services/cookie/tokens/token';
import { type CookieService } from '../../application/services/cookie/services/cookie.service';
import { AUTH_TOKENS } from '../../application/services/auth/tokens/token';
import { ResponseSchema } from '../../../../shared/decorators/response-schema.decorator';
import {
   loginWithCredentialReturnSchema,
   LoginWithCredentialReturnType,
   loginWithCredentialSchema,
   type LoginWithCredentialType,
   RegisterWithCredentialReturnType,
   registerWithCredentialSchema,
   sendOtpReturnSchema,
   verifyOtpReturnSchema,
   VerifyOtpReturnType,
   type RegsiterWithCredentialType,
} from '@app/contracts';
import { AuthService } from '../../application/services/auth/service/auth.service';

@Controller('auth')
export class AuthController {
   constructor(
      @Inject(AUTH_TOKENS.AuthService)
      private readonly authService: AuthService,

      @Inject(OTP_TOKENTS.OtpService)
      private readonly otpService: OtpService,

      @Inject(COOKIE_TOKEN.CookieService)
      private readonly cookieService: CookieService,
   ) {}

   @Post('otp/send')
   @ResponseSchema(sendOtpReturnSchema)
   async sendOtp(
      @Body(new ZodValidationPipe(sendOtpSchema)) dto: SendOtpInput,
   ): Promise<OtpSendResult> {
      return await this.otpService.sendOtp(OtpPurpose.REGISTER, dto.deviceId, dto.email);
   }

   @Post('otp/verify')
   @ResponseSchema(verifyOtpReturnSchema)
   async verifyOtp(
      @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
   ): Promise<VerifyOtpReturnType> {
      return await this.otpService.verifyOtp(OtpPurpose.REGISTER, dto.deviceId, dto.email, dto.otp);
   }

   @Post('register/complete/:verifyToken')
   @ResponseSchema(registerWithCredentialSchema)
   async registerWithCredentials(
      @Body(new ZodValidationPipe(registerWithCredentialSchema)) dto: RegsiterWithCredentialType,
      @Param('verifyToken') verifyToken: string,
      @Res({ passthrough: true }) response: Response,
   ): Promise<RegisterWithCredentialReturnType> {
      const valid = await this.otpService.consumeVerifyToken(
         OtpPurpose.REGISTER,
         dto.email,
         verifyToken,
      );
      if (!valid) throw new BadRequestException('Invalid or expired token');

      const result = await this.authService.registerWithCredentials({
         email: dto.email,
         password: dto.password,
         verifyToken: verifyToken,
      });

      this.cookieService.setRefreshToken(response, result.tokens.refreshToken);
      return {
         user: result.user,
         accessToken: result.tokens.accessToken,
      };
   }

   @Post('login')
   @ResponseSchema(loginWithCredentialReturnSchema)
   async loginWithCredentials(
      @Body(new ZodValidationPipe(loginWithCredentialSchema)) dto: LoginWithCredentialType,
      @Res({ passthrough: true }) response: Response,
   ): Promise<LoginWithCredentialReturnType> {
      const result = await this.authService.loginWithCredentials({
         email: dto.email,
         password: dto.password,
      });

      if (result.status !== 'authenticated') {
         throw new BadRequestException('Invalid credentials');
      }

      this.cookieService.setRefreshToken(response, result.tokens.refreshToken);
      return {
         user: result.user,
         accessToken: result.tokens.accessToken,
      };
   }

   // ---------- Login ----------

   // @Post('login')
   // @HttpCode(HttpStatus.OK)
   // async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput): Promise<void> {
   //    // 1. credentials check (generic "Invalid credentials")
   //    // 2. 2FA lagle sendOtp(OtpPurpose.LOGIN, ...) + short-lived challenge token
   //    // 3. noile access/refresh token issue
   // }

   // @Post('password/reset')
   // @HttpCode(HttpStatus.OK)
   // async resetPassword(
   //    @Body(new ZodValidationPipe(passwordResetSchema)) dto: PasswordResetInput,
   // ): Promise<void> {
   //    const valid = await this.otpService.consumeVerifyToken(
   //       OtpPurpose.PASSWORD,
   //       dto.email,
   //       dto.token,
   //    );
   //    if (!valid) throw new BadRequestException('Invalid or expired token');
   //    // await this.authService.resetPassword(dto.email, dto.password);
   //    // sob active session/refresh token revoke koro
   // }

   // ---------- Utils ----------

   @Get('otp/cooldown')
   async getcCooldownTime(
      @Query(new ZodValidationPipe(cooldownQuerySchema)) query: CooldownQuery,
   ): Promise<{ seconds: number }> {
      const seconds = await this.otpService.cooldownSeconds(
         query.purpose,
         query.deviceId,
         query.email,
      );
      return { seconds };
   }
}
