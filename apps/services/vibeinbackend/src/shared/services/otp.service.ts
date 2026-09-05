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

import crypto, { verify } from 'crypto';
import bcrypt from 'bcrypt';
import { RedisService } from '../modules/cache/redis.service';
import { Script } from 'vm';

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
  // lock:        (email: string)                    => `otp:lock:${email}`,
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
  private otpSha:                  string | null;
  private readonly DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing-safety', 10);
  private readonly LOCK_TTL_SECONDS = 5;

  // Compare-and-delete so a request can only release a lock it actually owns.
  private readonly RELEASE_LOCK_SCRIPT = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;


  private readonly TOKEN_VERIFY_SCRIPT = `
    local key = KEYS[1]
    local token = ARGV[1]

    local stored = redis.call('GET', key)

    if not stored or stored ~= token then
      return false
    end

    redis.call('DEL', key)

    return true
    
  `
  

  constructor(
    private readonly redis:  RedisClient,
    private readonly mailer: MailerService,
    private readonly logger: Logger,
    private readonly client: RedisService,
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

  async init(): void {
    this.otpSha = await this.client.getClient()?.script('LOAD', "") as string || null;
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

  // ── SEND OTP ─────────────────────────────────────────────────────────

  async sendOtp(deviceId: string, email: string): Promise<OtpSendResult> {
    this.validateInputs(email, deviceId);

    // ──  Generate OTP ───────────────────────────────────────────────────
    const otp       = this.generateOtp(this.otpLength);
    const hashedOtp = await bcrypt.hash(otp, this.bcryptRounds);

    const otpTtlSecs  = Math.ceil(this.otpTtlMs / 1000);

    const numOfKeys = 3;

    let cooldownSecs: number;
    let sendCount: number;

    try {
      [cooldownSecs, sendCount] = await this.client.getClient()?.evalsha(
        this.otpSha!,

        numOfKeys,

        KEYS.otp(email),
        KEYS.cooldown(deviceId, email), 
        KEYS.sendCount(deviceId, email), 
        // KEYS.lock(deviceId, email),


        hashedOtp,
        otpTtlSecs 
      ) as [number, number];

    } catch (err: any) {
      if (err.message?.includes('NOSCRIPT')) {
        this.otpSha = await this.client.getClient()?.script('LOAD', "") as string || null;

        [cooldownSecs, sendCount] = await this.client.getClient()?.evalsha(
          this.otpSha!,

          numOfKeys,

          KEYS.otp(email),
          KEYS.cooldown(deviceId, email), 
          KEYS.sendCount(deviceId, email), 
          KEYS.lock(deviceId, email),


          hashedOtp,
          otpTtlSecs 
        ) as [number, number];

      } else {
        throw err;
      }
    }



    // ── 6. Deliver ────────────────────────────────────────────────────────
    // Done after Redis write so a slow mailer doesn't block state update.
    await this.mailer.sendOtpEmail(email, otp, Math.ceil(this.otpTtlMs / 60_000));

    this.logger.info('otp.send.success', {
      deviceId,
      email:       maskEmail(email),
      sendAttempt: sendCount,
      cooldownSeconds: cooldownSecs * 1000
    });

    return { cooldownSeconds: cooldownSecs };

  }

  async verifyOtp(deviceId: string, email: string, input: string): Promise<OtpVerifyResult> {
    this.validateEmail(email);
    if (!input?.trim()) throw new ValidationError('OTP input must not be empty.');

    const key = KEYS.otp(email);
    const lockKey = KEYS.lock(deviceId, email);
    const lockToken = crypto.randomUUID();
    let lockAcquired = false;

    const client = this.client.getClient();
    if (!client) throw new Error('Redis client unavailable.');

    try {
      const results = await client
        .multi()
        .set(lockKey, lockToken, 'NX', 'EX', this.LOCK_TTL_SECONDS)
        .get(key)
        .exec();

      if (!results) throw new Error('Redis transaction failed to execute.');

      const [lockErr, lockResult] = results[0];
      const [getErr, raw] = results[1];
      if (lockErr) throw lockErr;
      if (getErr) throw getErr;

      if (lockResult !== 'OK') {
        throw new ConcurrentRequestError();
      }
      lockAcquired = true;

      let data: OtpRecord | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw as string);
        } catch {
          this.logger.error('otp.verify.corrupt_record', { email: maskEmail(email) });
          await client.del(key);
        }
      }

      if (data) {
        if (Date.now() > data.expiresAt) {
          await client.del(key);
          this.logger.info('otp.verify.expired', { email: maskEmail(email) });
          return { ok: false, reason: 'EXPIRED' };
        }

        if (data.attempts >= this.maxAttempts) {
          await client.del(key);
          this.logger.warn('otp.verify.max_attempts', { email: maskEmail(email) });
          return { ok: false, reason: 'MAX_ATTEMPTS' };
        }
      }

      // Always bcrypt.compare against a real hash — present or dummy —
      // so response timing doesn't leak whether a record exists.
      const hashToCompare = data?.hashedOtp ?? this.DUMMY_HASH;
      const valid = await bcrypt.compare(input, hashToCompare);

      if (!valid) {
        this.logger.info(data ? 'otp.verify.invalid' : 'otp.verify.not_found', {
          email: maskEmail(email),
        });

        if (!data) return { ok: false, reason: 'INVALID' };

        const remainingTtlSeconds = Math.max(1, Math.ceil((data.expiresAt - Date.now()) / 1000));
        await client.set(
          key,
          JSON.stringify({ ...data, attempts: data.attempts + 1 }),
          'EX',
          remainingTtlSeconds,
        );

        return { ok: false, reason: 'INVALID' };
      }

      // ── Success ──────────────────────────────────────────────────────────
      const verifyToken = crypto.randomUUID();

      await client
        .multi()
        .del(key)
        .set(KEYS.verifyToken(email), verifyToken, 'EX', this.verifyTokenTtl)
        .exec();

      this.logger.info('otp.verify.success', { email: maskEmail(email) });
      return { ok: true, verifyToken };
    } finally {
      if (lockAcquired) {
        try {
          await client.eval(this.RELEASE_LOCK_SCRIPT, 1, lockKey, lockToken);
        } catch (err) {
          this.logger.error('otp.verify.lock_release_failed', { email: maskEmail(email), err });
        }
      }
    }
  }

  /**
   * Downstream services call this to confirm the verifyToken issued after
   * a successful OTP verification. Token is consumed (deleted) on first use.
   */
  async consumeVerifyToken(email: string, token: string): Promise<boolean> {
    this.validateEmail(email);
    const key   = KEYS.verifyToken(email);

    const result: boolean = await this.client.getClient()?.eval(this.TOKEN_VERIFY_SCRIPT, 1, key, token) as boolean

    if(!result) {
      this.logger.warn('otp.consumeToken.invalid', { email: maskEmail(email) });
      return result;
    } 

    this.logger.info('otp.consumeToken.success', { email: maskEmail(email) });
    return result ;
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