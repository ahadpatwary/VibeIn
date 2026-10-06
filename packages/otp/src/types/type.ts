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

export type OtpVerifyResult = {
   verifyToken: string;
};

export interface OtpSendResult {
   cooldownSeconds: number; // how long until next send is allowed
}

export interface CooldownData {
   assignedAt: number; // Unix ms
   sendableAt: number; // Unix ms
}
