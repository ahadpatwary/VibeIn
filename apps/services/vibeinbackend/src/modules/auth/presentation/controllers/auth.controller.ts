import { OtpSendResult, OtpService, OtpVerifyResult } from '@app/otp';
import {
   BadRequestException,
   Body,
   Controller,
   Get,
   HttpCode,
   HttpStatus,
   Inject,
   Post,
   Query,
} from '@nestjs/common';

import {
   type CooldownQuery,
   cooldownQuerySchema,
   type PasswordResetInput,
   passwordResetSchema,
   type RegisterCompleteInput,
   registerCompleteSchema,
   type SendOtpInput,
   sendOtpSchema,
   type VerifyOtpInput,
   verifyOtpSchema,
} from '../schema';
import { OtpPurpose } from '../constants/constant';
import { ZodValidationPipe } from '../../../user/application/pipes/zodValidation.pipe';

@Controller('auth')
export class AuthController {
   constructor(
      @Inject('OTP_SERVICE')
      private readonly otpService: OtpService,
   ) {}

   @Post('register/otp/send')
   @HttpCode(HttpStatus.OK)
   sendRegisterOtp(
      @Body(new ZodValidationPipe(sendOtpSchema)) dto: SendOtpInput,
   ): Promise<OtpSendResult> {
      return this.otpService.sendOtp(OtpPurpose.REGISTER, dto.deviceId, dto.email);
   }

   @Post('register/otp/verify')
   @HttpCode(HttpStatus.OK)
   verifyRegisterOtp(
      @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
   ): Promise<OtpVerifyResult> {
      return this.otpService.verifyOtp(OtpPurpose.REGISTER, dto.deviceId, dto.email, dto.otp);
   }

   @Post('register/complete')
   @HttpCode(HttpStatus.CREATED)
   async completeRegister(
      @Body(new ZodValidationPipe(registerCompleteSchema)) dto: RegisterCompleteInput,
   ): Promise<void> {
      const valid = await this.otpService.consumeVerifyToken(
         OtpPurpose.REGISTER,
         dto.email,
         dto.token,
      );
      if (!valid) throw new BadRequestException('Invalid or expired token');
      // await this.authService.createAccount(dto.email, dto.password);
   }

   // ---------- Login ----------

   // @Post('login')
   // @HttpCode(HttpStatus.OK)
   // async login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginInput): Promise<void> {
   //    // 1. credentials check (generic "Invalid credentials")
   //    // 2. 2FA lagle sendOtp(OtpPurpose.LOGIN, ...) + short-lived challenge token
   //    // 3. noile access/refresh token issue
   // }

   @Post('login/otp/verify')
   @HttpCode(HttpStatus.OK)
   async verifyLoginOtp(
      @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
   ): Promise<OtpVerifyResult> {
      // challenge token verify na korle login bypass hobe
      return this.otpService.verifyOtp(OtpPurpose.LOGIN, dto.deviceId, dto.email, dto.otp);
   }

   // ---------- Password reset ----------

   @Post('password/forgot')
   @HttpCode(HttpStatus.OK)
   async forgotPassword(
      @Body(new ZodValidationPipe(sendOtpSchema)) dto: SendOtpInput,
   ): Promise<OtpSendResult> {
      // email exist na korleo same response dao
      return this.otpService.sendOtp(OtpPurpose.PASSWORD, dto.deviceId, dto.email);
   }

   @Post('password/otp/verify')
   @HttpCode(HttpStatus.OK)
   verifyPasswordOtp(
      @Body(new ZodValidationPipe(verifyOtpSchema)) dto: VerifyOtpInput,
   ): Promise<OtpVerifyResult> {
      return this.otpService.verifyOtp(OtpPurpose.PASSWORD, dto.deviceId, dto.email, dto.otp);
   }

   @Post('password/reset')
   @HttpCode(HttpStatus.OK)
   async resetPassword(
      @Body(new ZodValidationPipe(passwordResetSchema)) dto: PasswordResetInput,
   ): Promise<void> {
      const valid = await this.otpService.consumeVerifyToken(
         OtpPurpose.PASSWORD,
         dto.email,
         dto.token,
      );
      if (!valid) throw new BadRequestException('Invalid or expired token');
      // await this.authService.resetPassword(dto.email, dto.password);
      // sob active session/refresh token revoke koro
   }

   // ---------- Utils ----------

   @Get('otp/cooldown')
   async cooldown(
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
