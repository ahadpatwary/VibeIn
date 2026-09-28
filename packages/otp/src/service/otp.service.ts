import { ILogger, LOGGER_TOKENS, LoggerFactory } from '@app/logger';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { inject, injectable } from 'tsyringe';

import { EMAIL_REGEX, KEYS } from '../constants/constant';
import { ValidationError } from '../errors/exception';
import { StoreService } from '../infrastructure/cache/redis';
import { OTP_TOKENTS, OtpData } from '../tokens/token';
import { OtpConfig, OtpSendResult, OtpVerifyResult } from '../types/type';
import { maskEmail } from '../utils/emailMask';

@injectable()
export class OtpService {
   private readonly logger: ILogger;

   constructor(
      @inject(OTP_TOKENTS.optConfig)
      private readonly optConfig: OtpConfig,

      @inject(OTP_TOKENTS.storeService)
      private readonly storeService: StoreService,

      @inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory,
   ) {
      this.logger = factory.forModule('OTP_MODULE');
   }

   /** -> Returns remaining cooldown in seconds (0 when not in cooldown) */
   async cooldownSeconds(deviceId: string, email: string): Promise<number> {
      this.validateInputs(email, deviceId);
      const data = await this.storeService.cooldownData(KEYS.cooldown(deviceId, email));
      if (!data) return 0;
      const ms = data.sendableAt - Date.now();
      return ms > 0 ? Math.ceil(ms / 1000) : 0;
   }

   // ── SEND OTP ─────────────────────────────────────────────────────────

   async sendOtp(deviceId: string, email: string): Promise<OtpSendResult> {
      this.validateInputs(email, deviceId);

      const otp = this.generateOtp(this.optConfig.otpLength);
      const hashedOtp = await bcrypt.hash(otp, this.optConfig.bcryptRounds);

      const otpTtlSecs = String(Math.ceil(this.optConfig.otpTtlMs / 1000));

      const [cooldownSecs, sendCount] = await this.storeService.luaExecute<[number, number]>(
         'sendotp',
         [KEYS.otp(email), KEYS.cooldown(deviceId, email), KEYS.sendCount(deviceId, email)],
         [hashedOtp, otpTtlSecs],
      );

      console.log('OTP', otp);

      //TODO: task panding
      // Done after Redis write so a slow mailer doesn't block state update.
      // await this.mailer.sendOtpEmail(email, otp, Math.ceil(this.otpTtlMs / 60_000));

      this.logger.info('otp.send.success', {
         deviceId,
         email: maskEmail(email),
         sendAttempt: sendCount,
         cooldownSeconds: cooldownSecs * 1000,
      });

      return { cooldownSeconds: cooldownSecs };
   }

   async verifyOtp(deviceId: string, email: string, input: string): Promise<OtpVerifyResult> {
      this.validateEmail(email);
      if (!input?.trim()) throw new ValidationError('OTP input must not be empty.');

      const otpKey = KEYS.otp(email);
      const lockKey = KEYS.lock(deviceId, email);
      const lockToken = crypto.randomUUID();
      let lockAcquired = false;

      try {
         const otpData = await this.storeService.lockAquireAndGetOtp<OtpData | null>(
            lockKey,
            lockToken,
            this.optConfig.lockTtlSeconds,
            otpKey,
         );

         if (!otpData) return { ok: false, reason: 'INVALID' };

         lockAcquired = true;

         if (Date.now() > otpData.expiresAt) {
            await this.storeService.deleteKey(otpKey);
            this.logger.info('otp.verify.expired', { email: maskEmail(email) });
            return { ok: false, reason: 'EXPIRED' };
         }

         if (otpData.attempts >= this.optConfig.maxAttempts) {
            await this.storeService.deleteKey(otpKey);
            this.logger.warn('otp.verify.max_attempts', {
               email: maskEmail(email),
            });
            return { ok: false, reason: 'MAX_ATTEMPTS' };
         }

         const hashToCompare = otpData.hashedOtp;
         const valid = await bcrypt.compare(input, hashToCompare);

         if (!valid) {
            this.logger.info(otpData ? 'otp.verify.invalid' : 'otp.verify.not_found', {
               email: maskEmail(email),
            });

            const remainingTtlSeconds = Math.max(
               1,
               Math.ceil((otpData.expiresAt - Date.now()) / 1000),
            );
            const jsonStirng = JSON.stringify({ ...otpData, attempts: otpData.attempts + 1 });
            await this.storeService.attemptIncress(otpKey, jsonStirng, remainingTtlSeconds);

            return { ok: false, reason: 'INVALID' };
         }

         // ── Success ──────────────────────────────────────────────────────────
         const verifyToken = crypto.randomUUID();

         const verifyKey = KEYS.verifyToken(email);
         await this.storeService.deleteOtpAndSetVerifyToken(
            otpKey,
            verifyKey,
            verifyToken,
            this.optConfig.verifyTokenTtl,
         );

         this.logger.info('otp.verify.success', { email: maskEmail(email) });
         return { ok: true, verifyToken };
      } finally {
         if (lockAcquired) {
            try {
               await this.storeService.releaseLock(lockKey, lockToken);
            } catch (err) {
               this.logger.error('otp.verify.lock_release_failed', {
                  email: maskEmail(email),
                  err,
               });
            }
         }
      }
   }

   async consumeVerifyToken(email: string, token: string): Promise<boolean> {
      this.validateEmail(email);
      const key = KEYS.verifyToken(email);

      const result: boolean = await this.storeService.deviceVerified(key, token);

      return result;
   }

   private generateOtp(length: number): string {
      const max = 10 ** length; // e.g. 1_000_000 for 6 digits
      return crypto.randomInt(0, max).toString().padStart(length, '0');
   }

   private validateEmail(email: string): void {
      if (!email || !EMAIL_REGEX.test(email)) {
         throw new ValidationError('Invalid email address.');
      }
   }

   private validateDeviceId(deviceId: string): void {
      if (!deviceId?.trim()) {
         throw new ValidationError('deviceId must not be empty.');
      }
   }

   private validateInputs(email: string, deviceId: string): void {
      this.validateEmail(email);
      this.validateDeviceId(deviceId);
   }
}
