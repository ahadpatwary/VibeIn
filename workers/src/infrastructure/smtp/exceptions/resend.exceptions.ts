export abstract class ResendException extends Error {
    abstract readonly code: string;
    /** True if the operation is safe to retry (rate limit, 5xx, network blip). */
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

/** Bad payload: malformed `to`, missing `subject`, invalid attachment, etc. Not retryable. */
export class ResendValidationException extends ResendException {
    readonly code = 'RESEND_VALIDATION_ERROR' as const;
    readonly retryable = false;
}

/** Missing / invalid / restricted API key. Not retryable — needs a config fix. */
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

/**
 * Same idempotency key used concurrently (two in-flight requests at once).
 * Unlike `invalid_idempotent_request`, this is transient — the other
 * request just hasn't finished yet — so it's safe to retry after a delay.
 */
export class ResendIdempotencyConflictException extends ResendException {
    readonly code = 'RESEND_IDEMPOTENCY_CONFLICT' as const;
    readonly retryable = true;
}

/**
 * Same idempotency key reused with a DIFFERENT payload. Retrying is
 * pointless without changing the key or the payload — not retryable.
 */
export class ResendIdempotencyMismatchException extends ResendException {
    readonly code = 'RESEND_IDEMPOTENCY_MISMATCH' as const;
    readonly retryable = false;
}

/** Monthly or daily account quota exhausted. Retrying won't help until the quota resets. */
export class ResendQuotaExceededException extends ResendException {
    readonly code = 'RESEND_QUOTA_EXCEEDED' as const;
    readonly retryable = false;
}

/** Account flagged / access restricted for security reasons. Not retryable. */
export class ResendSecurityException extends ResendException {
    readonly code = 'RESEND_SECURITY_ERROR' as const;
    readonly retryable = false;
}

/** Wrong HTTP method for the endpoint — a code bug, not a runtime condition. Not retryable. */
export class ResendMethodNotAllowedException extends ResendException {
    readonly code = 'RESEND_METHOD_NOT_ALLOWED' as const;
    readonly retryable = false;
}

/** Anything we didn't explicitly account for. Not retried by default — fail loud. */
export class ResendUnknownException extends ResendException {
    readonly code = 'RESEND_UNKNOWN_ERROR' as const;
    readonly retryable = false;
}
