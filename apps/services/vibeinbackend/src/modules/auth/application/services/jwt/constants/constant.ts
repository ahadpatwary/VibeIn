import { VerifyOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { TokenServiceConfig } from '../types/jwt.type';

export const KEYS = {
   session: (userId: string, sessionId: string) => `session:{${userId}}:${sessionId}`,
   userSessions: (userId: string) => `user-sessions:{${userId}}`,
};

export const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

export const jwtConfigOpt: Partial<TokenServiceConfig> = {
   issuer: 'soundfear.com',
   audience: 'SoundFear_Client',
   accessTokenTTL: '15m',
   refreshTokenTTL: '7d',
};

export const verifyOpt: VerifyOptions = {
   algorithms: ['HS256'],
   issuer: 'soundfear.com',
   complete: true,
   jwtid: uuidv4(),
};
