import { JwtPayload, SignOptions, TokenExpiredError } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AccessTokenPayload, accessTokenPayloadSchema } from './schemas/accessToken.schema';
import { RefreshTokenPayload, refreshTokenPayloadSchema } from './schemas/refreshToken.schema';
import { DecodedToken, type TokenServiceConfig } from './types/jwt.type';
import { TokenInvalidError } from './error/exception';
import { inject, injectable } from 'tsyringe';
import { verifyOpt } from './constants/constant';
import { JWT_TOKENS } from './tokens/token';

@injectable()
export class TokenService {
   constructor(
      @inject(JWT_TOKENS.tokenConfig)
      private readonly config: Required<TokenServiceConfig>,
   ) {}

   generateAccessToken(payload: AccessTokenPayload): string {
      const validated = this.#validation(accessTokenPayloadSchema, payload);
      return this.#sign(validated, this.config.secret, this.config.accessTokenTTL);
   }

   generateRefreshToken(payload: RefreshTokenPayload): string {
      const validated = this.#validation(refreshTokenPayloadSchema, payload);
      return this.#sign(validated, this.config.refreshSecret, this.config.refreshTokenTTL);
   }

   // ── Verify ──────────────────────────────────────────────────────────────────

   verifyAccessToken(token: string): AccessTokenPayload & JwtPayload {
      const decoded = this.#verify(token, this.config.secret);
      return this.#validation(accessTokenPayloadSchema, decoded);
   }

   verifyRefreshToken(token: string): RefreshTokenPayload & JwtPayload {
      const decoded = this.#verify(token, this.config.refreshSecret);
      return this.#validation(refreshTokenPayloadSchema, decoded);
   }

   decodeToken(token: string): DecodedToken | null {
      try {
         return jwt.decode(token) as DecodedToken | null;
      } catch {
         return null;
      }
   }

   #sign(
      payload: Record<string, unknown>,
      secret: string,
      expiresIn: SignOptions['expiresIn'],
   ): string {
      const options: SignOptions = {
         algorithm: 'HS256',
         expiresIn,
         notBefore: '0s',
         // issuer: this.issuer,
         // audience: this.audience,
      };

      try {
         return jwt.sign(payload, secret, options);
      } catch (err) {
         throw new Error(`TokenService: failed to sign token — ${(err as Error).message}`);
      }
   }

   #verify(token: string, secret: string): JwtPayload {
      try {
         return jwt.verify(token, secret, verifyOpt) as JwtPayload;
      } catch (err) {
         if (err instanceof jwt.TokenExpiredError) {
            throw new TokenExpiredError(err.message, err.expiredAt);
         }

         /** -> Covers JsonWebTokenError (bad signature, malformed) & NotBeforeError */
         throw new TokenInvalidError((err as Error).message);
      }
   }

   #validation<T>(schema: z.ZodSchema<T>, payload: unknown): T {
      const result = schema.safeParse(payload);

      if (!result.success) {
         throw new TokenInvalidError('Invalid token payload');
      }

      return result.data;
   }
}
