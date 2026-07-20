

export abstract class ResendException extends Error {
    abstract readonly code: string;
    abstract readonly retryable: boolean;

    constructor(message: string, options?: { cause?: unknown }) {
        super(message);
        this.name = this.constructor.name;
        if (options?.cause !== undefined) {
            (this as { cause?: unknown }).cause = options.cause;
        }
        Error.captureStackTrace?.(this, this.constructor);
    }
}


export class ResendValidationException extends ResendException {
    readonly code = 'RESEND_VALIDATION_ERROR' as const;
    readonly retryable = false;
}

export class ResendAuthException extends ResendException {
    readonly code = 'RESEND_AUTH_ERROR' as const;
    readonly retryable = false;
}

/** 429 from Resend. Retryable after backing off. */
export class ResendRateLimitException extends ResendException {
    readonly code = 'RESEND_RATE_LIMIT' as const;
    readonly retryable = true;

    constructor(
        message: string,
        public readonly retryAfterSeconds?: number,
        cause?: unknown,
    ) {
        super(message, { cause });
    }
}

/** Domain not verified, template/resource not found, etc. Not retryable. */
export class ResendNotFoundException extends ResendException {
    readonly code = 'RESEND_NOT_FOUND' as const;
    readonly retryable = false;
}

/** 5xx from Resend's own infrastructure. Retryable. */
export class ResendServerException extends ResendException {
    readonly code = 'RESEND_SERVER_ERROR' as const;
    readonly retryable = true;
}

/** The SDK call itself threw — DNS/timeout/connection reset. Retryable. */
export class ResendNetworkException extends ResendException {
    readonly code = 'RESEND_NETWORK_ERROR' as const;
    readonly retryable = true;
}

/** Anything we didn't explicitly account for. Not retried by default — fail loud. */
export class ResendUnknownException extends ResendException {
    readonly code = 'RESEND_UNKNOWN_ERROR' as const;
    readonly retryable = false;
}