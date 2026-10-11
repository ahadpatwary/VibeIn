import { registerLogger } from '@app/logger';
import type { DependencyContainer } from 'tsyringe';
import { container } from 'tsyringe';

import { loadOtpConfig } from '../config/config';
import { StoreService } from '../infrastructure/cache/redis';
import { OtpService } from '../service/otp.service';
import { OTP_TOKENTS } from '../tokens/token';
import type { OtpConfig } from '../types/type';

export function registerOtp(
   targetContainer: DependencyContainer = container,
   otpConfig: Partial<OtpConfig>,
) {
   const cfg = loadOtpConfig(otpConfig);

   registerLogger(targetContainer, {});

   targetContainer.registerInstance(OTP_TOKENTS.optConfig, cfg);

   targetContainer.registerInstance(OTP_TOKENTS.storeService, StoreService);

   targetContainer.registerInstance(OTP_TOKENTS.OtpService, OtpService);
}
