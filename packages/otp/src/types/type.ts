export interface BackoffEntry {
   upTo: number; // inclusive send-count threshold
   cooldownMs: number;
}

export interface OtpConfig {
   otpLength: number;
   otpTtlMs: number;
   maxAttempts: number;
   bcryptRounds: number;
   lockTtlSeconds: number;
   verifyTokenTtl: number;
   backoff?: BackoffEntry[];
}

export type OtpVerifyResult =
   | { ok: true; verifyToken: string }
   | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'MAX_ATTEMPTS' | 'INVALID' };

export interface OtpSendResult {
   cooldownSeconds: number; // how long until next send is allowed
}

export interface CooldownData {
   assignedAt: number; // Unix ms
   sendableAt: number; // Unix ms
}
