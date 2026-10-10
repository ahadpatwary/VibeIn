import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth/service/auth.service';
import { AUTH_TOKENS } from './application/services/auth/tokens/token';
import { OTP_TOKENTS, OtpService } from '@app/otp';
import { COOKIE_TOKEN, CookieService } from './application/services/cookie';
import { AuthIdentityRepository } from './application/services/auth/infrastructure/auth.repository';
import { UseCaseRepository } from './application/services/auth/infrastructure/use-case.repository';
import { PASS_HASHER_TOKEN, PasswordHasher } from './application/services/hasher';
import { SESSION_TOKEN, SessionService } from './application/services/session';
import { StoreService } from './application/services/session/infrastructure/redis.service';
import { JWT_TOKENS, TokenService } from './application/services/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { registerToken } from './application/services/jwt/container/container';
import { container } from 'tsyringe';

@Module({
   controllers: [AuthController],
   imports: [ConfigModule],
   providers: [
      /** Auth service has been resolved */
      {
         provide: AUTH_TOKENS.AuthService,
         useClass: AuthService,
      },
      {
         provide: AUTH_TOKENS.AuthRepository,
         useClass: AuthIdentityRepository,
      },
      {
         provide: AUTH_TOKENS.UseCaseRepository,
         useClass: UseCaseRepository,
      },

      /** Otp service has been resolved */
      {
         provide: OTP_TOKENTS.OtpService,
         useClass: OtpService,
      },

      /** Cookie service has been resolved */
      {
         provide: COOKIE_TOKEN.CookieService,
         useClass: CookieService,
      },

      /** PassHasherService has been resolved */
      {
         provide: PASS_HASHER_TOKEN.PassHasherService,
         useClass: PasswordHasher,
      },

      /**  jsw service eita pore solved korbo*/
      {
         provide: 'TOKEN',
         inject: [ConfigService],

         useFactory: (config: ConfigService) => {
            registerToken(container, {
               secret: config.get<string>('token.secret')!,
               refreshSecret: config.get<string>('token.refreshToken')!,
            });

            return true;
         },
      },

      {
         provide: JWT_TOKENS.TokenService,
         /** token service depend on logger initialize */
         inject: ['TOKEN'],
         useFactory: () => container.resolve(TokenService),
      },

      /** Session service has been resolved */
      {
         provide: SESSION_TOKEN.SessionService,
         useClass: SessionService,
      },
      {
         provide: SESSION_TOKEN.StoreService,
         useClass: StoreService,
      },
   ],
   exports: [],
})
export class AuthModule {}
