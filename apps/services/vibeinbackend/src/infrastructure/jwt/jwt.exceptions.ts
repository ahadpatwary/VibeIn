
const sign = {
    ahad: "ahad"
}



export abstract class JwtException extends Error {
    abstract readonly code: string;

    constructor(message: string, options?: { cause?: unknown }) {
      super(message);
      this.name = this.constructor.name;
      if (options?.cause !== undefined) {
        (this as { cause?: unknown }).cause = options.cause;
      }
      Error.captureStackTrace?.(this, this.constructor);
    }
}


export class JwtExpiredException extends JwtException {
    readonly code = 'JWT_EXPIRED' as const;

    constructor(public readonly expiredAt: Date, cause?: unknown) {
        super(`Token expired at ${expiredAt.toISOString()}`, { cause });
    }
}

export class JwtNotActiveException extends JwtException {
    readonly code = 'JWT_NOT_ACTIVE' as const;

    constructor(public readonly notBefore: Date, cause?: unknown) {
        super(`Token not active until ${notBefore.toISOString()}`, { cause });
    }
}


export class JwtMalformedException extends JwtException {
    readonly code = 'JWT_MALFORMED' as const;

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}


export class JwtSignException extends JwtException {
    readonly code = 'JWT_SIGN_ERROR' as const;

    constructor(message: string, cause?: unknown) {
        super(message, { cause });
    }
}


export class JwtUnknownException extends JwtException {
    readonly code = 'JWT_UNKNOWN_ERROR' as const;

    constructor(cause?: unknown) {
        super('An unknown JWT error occurred', { cause });
    }
}