import { Inject, Injectable } from '@nestjs/common';
import jwt, { JwtPayload, SignOptions, VerifyOptions, type Secret } from 'jsonwebtoken';
import { JwtSignException } from './jwt.exceptions';
import { mapJwtError } from './map-jwt-error';


export const JWT_SECRET = Symbol('JWT_SECRET');
const ALGORITHM = 'HS256' as const;

@Injectable()
export class JwtService {
    constructor(@Inject(JWT_SECRET) private readonly secret: Secret) {
        if (typeof secret === 'string' && secret.length < 32) {
            throw new Error(
                'JWT secret must be at least 32 characters for HS256 to be secure',
            );
        }
    }


    sign(payload: object, options?: SignOptions): string {
        try {
            return jwt.sign(payload, this.secret, {
                algorithm: ALGORITHM,
                ...options,
            });
        } catch (error) {
   
            throw new JwtSignException(
                ( error instanceof Error ) ? error.message : 'Failed to sign token',
                error,
            );
        }
    }


    decode(token: string): JwtPayload | string | null {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw mapJwtError(error);
        }
    }


    verify<T extends JwtPayload = JwtPayload>(
        token: string,
        options?: VerifyOptions,
    ): T | string {
        try {
            return jwt.verify(token, this.secret, {
                algorithms: [ALGORITHM],
                ...options,
            }) as T | string;
        } catch (error) {
            throw mapJwtError(error);
        }
    }
}