import type { DependencyContainer } from 'tsyringe';
import { container } from 'tsyringe';

import { loadResedConfig } from '../config/config';
import { RESEND_TOKEN } from '../tokens/token';
import type { ResendConfig } from '../types/resend.type';

export function registerSmtp(
   targetContainer: DependencyContainer = container,
   config: ResendConfig,
) {
   const cfg = loadResedConfig(config);

   targetContainer.registerInstance(RESEND_TOKEN.resendConfig, cfg);
}
