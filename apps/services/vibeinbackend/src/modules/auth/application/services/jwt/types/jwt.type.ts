import { UserRole } from '@app/db-schemas';
import { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface DecodedToken extends Required<JwtPayload> {
   sub: string;
   deviceId: string;
   accountId: string;
   role: UserRole;
}

export interface TokenServiceConfig {
   secret: string;
   refreshSecret: string;
   issuer?: string;
   audience?: string;
   accessTokenTTL?: SignOptions['expiresIn']; // default: "15m"
   refreshTokenTTL?: SignOptions['expiresIn']; // default: "7d"
}
