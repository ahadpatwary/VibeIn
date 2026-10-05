import type { BackoffEntry, OtpConfig } from '../types/type';

export const DEFAULT_BACKOFF: BackoffEntry[] = [
   { upTo: 2, cooldownMs: 1 * 60 * 1000 }, // ≤2  sends → 1 min
   { upTo: 5, cooldownMs: 3 * 60 * 1000 }, // ≤5  sends → 3 min
   { upTo: Infinity, cooldownMs: 24 * 60 * 60 * 1000 }, //  >5 sends → 24 h
];

export const otpConfig: OtpConfig = {
   otpLength: 6,
   otpTtlMs: 5 * 60 * 1000,
   maxAttempts: 5,
   bcryptRounds: 10,
   lockTtlSeconds: 10,
   verifyTokenTtl: 2 * 60,
   backoff: DEFAULT_BACKOFF,
};

export const KEYS = {
   otp: (prefix: string, email: string) => `${prefix}:otp:data:${email}`,
   cooldown: (prefix: string, deviceId: string, email: string) =>
      `${prefix}:otp:cooldown:${deviceId}:${email}`,
   sendCount: (prefix: string, deviceId: string, email: string) =>
      `${prefix}:otp:sendCount:${deviceId}:${email}`,
   lock: (prefix: string, deviceId: string, email: string) =>
      `${prefix}:otp:lock:${deviceId}:${email}`,
   // lock:        (email: string)                    => `otp:lock:${email}`,
   verifyToken: (prefix: string, email: string) => `${prefix}:otp:verified:${email}`,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
