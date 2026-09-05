import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

import {
    JwtException,
    JwtExpiredException,
    JwtNotActiveException,
    JwtMalformedException,
    JwtUnknownException,
} from './jwt.exceptions';


export function mapJwtError(error: unknown): JwtException {
    if (error instanceof TokenExpiredError) {
        return new JwtExpiredException(error.expiredAt, error);
    }

    if (error instanceof NotBeforeError) {
        return new JwtNotActiveException(error.date, error);
    }

    if (error instanceof JsonWebTokenError) {
        return new JwtMalformedException(error.message, error);
    }

    return new JwtUnknownException(error);
}