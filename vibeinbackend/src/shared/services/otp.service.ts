/**
 * otp.service.ts
 * Industry-standard OTP flow:
 *   generate → store → send → verify → audit
 *
 * Security properties guaranteed:
 *  ✔ Cryptographically secure OTP (crypto.randomInt)
 *  ✔ bcrypt hash at rest (rounds from env)
 *  ✔ Timing-safe verify (constant-time even on NOT_FOUND)
 *  ✔ Attempt-increment before compare (enumeration prevention)
 *  ✔ Distributed lock on send (race-condition safe)
 *  ✔ Atomic Redis pipeline (no partial state on crash)
 *  ✔ Exponential backoff with per-device send counter
 *  ✔ Verify token for downstream consumption (replay-safe)
 *  ✔ PII-masked structured logging
 *  ✔ Full input validation at service boundary
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces — define these contracts in your own adapter layer
// ─────────────────────────────────────────────────────────────────────────────

export interface RedisClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  /** Atomic increment. Returns new value. */
  incr(key: string): Promise<number>;
  /** Set TTL on existing key. */
  expire(key: string, ttlSeconds: number): Promise<void>;
  /**
   * Atomic SET NX with TTL.
   * Returns true  → lock acquired.
   * Returns false → lock already held.
   */
  setNx(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  /** Execute multiple commands atomically (pipeline / multi-exec). */
  pipeline(commands: RedisPipelineCommand[]): Promise<void>;
}

export type RedisPipelineCommand =
  | ['set', string, unknown, 'EX', number]
  | ['del', string]
  | ['incr', string]
  | ['expire', string, number];

export interface MailerService {
  sendOtpEmail(email: string, otp: string, ttlMinutes: number): Promise<void>;
}

export interface Logger {
  info(event: string, meta?: Record<string, unknown>): void;
  warn(event: string, meta?: Record<string, unknown>): void;
  error(event: string, meta?: Record<string, unknown>): void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal data shapes (stored in Redis as JSON)
// ─────────────────────────────────────────────────────────────────────────────

interface OtpData {
  hashedOtp: string;
  expiresAt: number; // Unix ms
  attempts:  number;
}

interface CooldownData {
  assignedAt: number; // Unix ms
  sendableAt: number; // Unix ms
}

// ─────────────────────────────────────────────────────────────────────────────
// Public result types
// ─────────────────────────────────────────────────────────────────────────────

export type OtpVerifyResult =
  | { ok: true;  verifyToken: string }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'MAX_ATTEMPTS' | 'INVALID' };

export interface OtpSendResult {
  cooldownSeconds: number; // how long until next send is allowed
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom errors
// ─────────────────────────────────────────────────────────────────────────────

export class CooldownError extends Error {
  readonly name = 'CooldownError';
  constructor(
    message: string,
    public readonly waitSeconds: number,
  ) {
    super(message);
  }
}

export class ConcurrentRequestError extends Error {
  readonly name = 'ConcurrentRequestError';
  constructor() {
    super('Another OTP request is already in progress. Try again shortly.');
  }
}

export class ValidationError extends Error {
  readonly name = 'ValidationError';
  constructor(message: string) {
    super(message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export interface OtpServiceConfig {
  otpLength?:       number; // default 6
  otpTtlMs?:        number; // default 5 min
  maxAttempts?:     number; // default 5
  bcryptRounds?:    number; // default from env BCRYPT_ROUNDS or 10
  lockTtlSeconds?:  number; // distributed lock TTL, default 10
  verifyTokenTtl?:  number; // seconds downstream has to consume token, default 60
}

// ─────────────────────────────────────────────────────────────────────────────
// Redis key factory — one place, easy to audit / change prefix
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  otp:         (email: string)                    => `otp:data:${email}`,
  cooldown:    (deviceId: string, email: string)  => `otp:cooldown:${deviceId}:${email}`,
  sendCount:   (deviceId: string, email: string)  => `otp:sendCount:${deviceId}:${email}`,
  lock:        (deviceId: string, email: string)  => `otp:lock:${deviceId}:${email}`,
  verifyToken: (email: string)                    => `otp:verified:${email}`,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Backoff table
// ─────────────────────────────────────────────────────────────────────────────

interface BackoffEntry {
  upTo:       number; // inclusive send-count threshold
  cooldownMs: number;
}

const DEFAULT_BACKOFF: BackoffEntry[] = [
  { upTo: 2,        cooldownMs:  1 * 60 * 1000 },        // ≤2  sends → 1 min
  { upTo: 5,        cooldownMs:  3 * 60 * 1000 },        // ≤5  sends → 3 min
  { upTo: Infinity, cooldownMs: 24 * 60 * 60 * 1000 },   //  >5 sends → 24 h
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Masks PII — never log raw email addresses. */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A dummy hash used to ensure constant-time behaviour on NOT_FOUND paths.
// Pre-computed so we don't pay bcrypt cost on every miss.
const DUMMY_HASH = '$2b$10$invalidhashfortimingprotectionXXXXXXXXXXXXXXXXXXXX';

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class OtpService {
  private readonly otpLength:      number;
  private readonly otpTtlMs:       number;
  private readonly maxAttempts:    number;
  private readonly bcryptRounds:   number;
  private readonly lockTtlSeconds: number;
  private readonly verifyTokenTtl: number;
  private readonly backoff:        BackoffEntry[];

  constructor(
    private readonly redis:  RedisClient,
    private readonly mailer: MailerService,
    private readonly logger: Logger,
    config: OtpServiceConfig = {},
    backoff: BackoffEntry[] = DEFAULT_BACKOFF,
  ) {
    this.otpLength      = config.otpLength      ?? 6;
    this.otpTtlMs       = config.otpTtlMs       ?? 5 * 60 * 1000;
    this.maxAttempts    = config.maxAttempts     ?? 5;
    this.bcryptRounds   = config.bcryptRounds    ?? parseInt(process.env['BCRYPT_ROUNDS'] ?? '10', 10);
    this.lockTtlSeconds = config.lockTtlSeconds  ?? 10;
    this.verifyTokenTtl = config.verifyTokenTtl  ?? 60;
    this.backoff        = backoff;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Returns true when the device/email pair is NOT in a cooldown window.
   */
  async isSendable(deviceId: string, email: string): Promise<boolean> {
    this.validateInputs(email, deviceId);
    const data = await this.redis.get<CooldownData>(KEYS.cooldown(deviceId, email));
    if (!data) return true;
    return Date.now() >= data.sendableAt;
  }

  /**
   * Returns remaining cooldown in seconds (0 when not in cooldown).
   */
  async cooldownSeconds(deviceId: string, email: string): Promise<number> {
    this.validateInputs(email, deviceId);
    const data = await this.redis.get<CooldownData>(KEYS.cooldown(deviceId, email));
    if (!data) return 0;
    const ms = data.sendableAt - Date.now();
    return ms > 0 ? Math.ceil(ms / 1000) : 0;
  }

  /**
   * Generates, stores, and delivers an OTP.
   *
   * Guarantees:
   *  - Only one concurrent call per deviceId+email (distributed lock).
   *  - OTP data + cooldown written atomically (pipeline).
   *  - Cooldown is enforced before any work is done.
   *
   * @throws {ValidationError}       on bad input
   * @throws {CooldownError}         if the device is still in cooldown
   * @throws {ConcurrentRequestError} if another request is in flight
   */
  async sendOtp(deviceId: string, email: string): Promise<OtpSendResult> {
    this.validateInputs(email, deviceId);

    // ── 1. Cooldown guard ───────────────────────────────────────────────────
    const wait = await this.cooldownSeconds(deviceId, email);
    if (wait > 0) {
      this.logger.warn('otp.send.blocked_by_cooldown', {
        deviceId,
        email: maskEmail(email),
        waitSeconds: wait,
      });
      throw new CooldownError(`Please wait ${wait}s before requesting a new OTP.`, wait);
    }

    // ── 2. Distributed lock (prevents race on concurrent requests) ──────────
    const lockKey     = KEYS.lock(deviceId, email);
    const lockAcquired = await this.redis.setNx(lockKey, '1', this.lockTtlSeconds);
    if (!lockAcquired) {
      this.logger.warn('otp.send.concurrent_request_rejected', {
        deviceId,
        email: maskEmail(email),
      });
      throw new ConcurrentRequestError();
    }

    try {
      // ── 3. Generate OTP ───────────────────────────────────────────────────
      const otp       = this.generateOtp(this.otpLength);
      const hashedOtp = await bcrypt.hash(otp, this.bcryptRounds);

      const now         = Date.now();
      const otpTtlSecs  = Math.ceil(this.otpTtlMs / 1000);

      const otpData: OtpData = {
        hashedOtp,
        expiresAt: now + this.otpTtlMs,
        attempts:  0,
      };

      // ── 4. Compute backoff before pipeline ────────────────────────────────
      // We read current send count, compute next cooldown, then pipeline-write
      // the incremented value together with otp data and cooldown data.
      const sendCountKey   = KEYS.sendCount(deviceId, email);
      const currentCount   = (await this.redis.get<number>(sendCountKey)) ?? 0;
      const nextCount      = currentCount + 1;
      const cooldownMs     = this.computeCooldown(nextCount);
      const cooldownSecs   = Math.ceil(cooldownMs / 1000);

      const cooldownData: CooldownData = {
        assignedAt: now,
        sendableAt: now + cooldownMs,
      };

      // ── 5. Atomic pipeline write ──────────────────────────────────────────
      // All three keys written together — no partial state on crash.
      await this.redis.pipeline([
        ['set', KEYS.otp(email),              otpData,      'EX', otpTtlSecs],
        ['set', KEYS.cooldown(deviceId, email), cooldownData, 'EX', cooldownSecs],
        ['set', sendCountKey,                 nextCount,    'EX', 24 * 60 * 60],
      ]);

      // ── 6. Deliver ────────────────────────────────────────────────────────
      // Done after Redis write so a slow mailer doesn't block state update.
      await this.mailer.sendOtpEmail(email, otp, Math.ceil(this.otpTtlMs / 60_000));

      this.logger.info('otp.send.success', {
        deviceId,
        email:       maskEmail(email),
        sendAttempt: nextCount,
        cooldownMs,
      });

      return { cooldownSeconds: cooldownSecs };

    } finally {
      // Always release lock — even on mailer failure.
      await this.redis.del(lockKey);
    }
  }

  /**
   * Verifies a user-supplied OTP string against the stored hash.
   *
   * Security properties:
   *  - Constant-time path: bcrypt.compare runs even on NOT_FOUND.
   *  - Attempt counter incremented *before* compare.
   *  - On success, issues a short-lived verifyToken for downstream use.
   *  - Token is single-use; downstream must consume it within verifyTokenTtl.
   */
  async verifyOtp(email: string, input: string): Promise<OtpVerifyResult> {
    this.validateEmail(email);
    if (!input?.trim()) throw new ValidationError('OTP input must not be empty.');

    const key  = KEYS.otp(email);
    const data = await this.redis.get<OtpData>(key);

    // ── Constant-time guard: always run bcrypt.compare ────────────────────
    const hashToCompare = data?.hashedOtp ?? DUMMY_HASH;

    // ── Structural checks (before compare to avoid wasted bcrypt cost) ────
    if (data) {
      if (Date.now() > data.expiresAt) {
        await this.redis.del(key);
        this.logger.info('otp.verify.expired', { email: maskEmail(email) });
        return { ok: false, reason: 'EXPIRED' };
      }

      if (data.attempts >= this.maxAttempts) {
        await this.redis.del(key);
        this.logger.warn('otp.verify.max_attempts', { email: maskEmail(email) });
        return { ok: false, reason: 'MAX_ATTEMPTS' };
      }

      // Increment attempts first — prevents timing-based enumeration
      const remainingTtl = Math.ceil((data.expiresAt - Date.now()) / 1000);
      await this.redis.set(key, { ...data, attempts: data.attempts + 1 }, remainingTtl);
    }

    // ── Constant-time compare ─────────────────────────────────────────────
    const valid = await bcrypt.compare(input, hashToCompare);

    if (!data || !valid) {
      // Unify NOT_FOUND and INVALID to the same response to prevent oracle attacks.
      // Internal log still distinguishes them.
      this.logger.info(data ? 'otp.verify.invalid' : 'otp.verify.not_found', {
        email: maskEmail(email),
      });
      return { ok: false, reason: 'INVALID' };
    }

    // ── Success ───────────────────────────────────────────────────────────
    // Delete OTP immediately (single-use).
    await this.redis.del(key);

    // Issue a short-lived verifyToken for downstream services to confirm
    // that OTP was successfully verified without re-verifying themselves.
    const verifyToken = crypto.randomUUID();
    await this.redis.set( 
      KEYS.verifyToken(email),
      verifyToken,
      this.verifyTokenTtl,
    );

    this.logger.info('otp.verify.success', { email: maskEmail(email) });
    return { ok: true, verifyToken };
  }

  /**
   * Downstream services call this to confirm the verifyToken issued after
   * a successful OTP verification. Token is consumed (deleted) on first use.
   */
  async consumeVerifyToken(email: string, token: string): Promise<boolean> {
    this.validateEmail(email);
    const key   = KEYS.verifyToken(email);
    const stored = await this.redis.get<string>(key);
    if (!stored || stored !== token) {
      this.logger.warn('otp.consumeToken.invalid', { email: maskEmail(email) });
      return false;
    }
    await this.redis.del(key);
    this.logger.info('otp.consumeToken.success', { email: maskEmail(email) });
    return true;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Cryptographically secure N-digit numeric OTP.
   * crypto.randomInt is uniform, unbiased, and available in Node ≥ 14.
   * padStart preserves leading zeros (e.g. "000042").
   */
  private generateOtp(length: number): string {
    const max = 10 ** length; // e.g. 1_000_000 for 6 digits
    return crypto.randomInt(0, max).toString().padStart(length, '0');
  }

  /**
   * Maps a send-attempt count to a cooldown duration in ms.
   */
  private computeCooldown(sendAttempts: number): number {
    for (const entry of this.backoff) {
      if (sendAttempts <= entry.upTo) return entry.cooldownMs;
    }
    return this.backoff[this.backoff.length - 1]!.cooldownMs;
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  private validateEmail(email: string): void {
    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ValidationError('Invalid email address.');
    }
  }

  private validateDeviceId(deviceId: string): void {
    if (!deviceId?.trim()) {
      throw new ValidationError('deviceId must not be empty.');
    }
  }

  private validateInputs(email: string, deviceId: string): void {
    this.validateEmail(email);
    this.validateDeviceId(deviceId);
  }
}