import { container, DependencyContainer } from 'tsyringe';
import { TokenServiceConfig } from '../types/jwt.type';
import { loadTokenConfig } from '../config/config';
import { JWT_TOKENS } from '../tokens/token';
import { TokenService } from '../jwt.auth';

export function registerToken(
   targetContainer: DependencyContainer = container,
   config: TokenServiceConfig,
) {
   const cfg = loadTokenConfig(config);

   targetContainer.registerInstance(JWT_TOKENS.TokenConfig, cfg);

   targetContainer.registerInstance(JWT_TOKENS.TokenService, TokenService);
}
