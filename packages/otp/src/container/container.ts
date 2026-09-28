import type { DependencyContainer } from 'tsyringe';
import { container } from 'tsyringe';

import { loadOtpConfig } from '../config/config';
import { StoreService } from '../infrastructure/cache/redis';
import { OTP_TOKENTS } from '../tokens/token';
import type { OtpConfig } from '../types/type';

export function registerOtp(
   targetContainer: DependencyContainer = container,
   otpConfig: Partial<OtpConfig>,
) {
   const cfg = loadOtpConfig(otpConfig);

   targetContainer.registerInstance(OTP_TOKENTS.optConfig, cfg);

   targetContainer.registerInstance(OTP_TOKENTS.storeService, StoreService);
}
