import jwt, { JwtPayload, SignOptions, VerifyOptions, JsonWebTokenError } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { z } from "zod";
import type { Redis, Cluster } from 'ioredis';
// import { readFileSync } from "fs";
// import path from "path";
// import redis from 'ioredis';
import { RedisService } from "../modules/cache/redis.service";


// ─── Register the Lua script as a custom command ──────────────────────────────
// ioredis caches the script (SCRIPT LOAD / EVALSHA) automatically after the
// first call, so this is efficient — no need to re-send the script every time.
 
// const rotateScript = readFileSync(
//   path.join(__dirname, "rotate_session.lua"),
//   "utf-8"
// );
 
// redis.defineCommand("rotateSessions", { 
//   numberOfKeys: 2,
//   lua: rotateScript,
// });

const luaRoateSession = `
---@type string[]
local sessionKey   = KEYS[1]    
---@type string[]
local userAllSession = KEYS[2]    

local sid = ARGV[1]
local oldJti = ARGV[2]
local newJti = ARGV[3]
local ttl    = tonumber(ARGV[4])

-- 1. Session exists?
if redis.call('EXISTS', sessionKey) == 0 then
  return {'NOT_FOUND', 'SESSION_NOT_FOUND'}
end

local status    = redis.call('HGET', sessionKey, 'status')
local revokedReason = redis.call('HGET', sessionKey, 'reason')
local storedJti = redis.call('HGET', sessionKey, 'jti')

-- 2. Session must be active
if status ~= 'ACTIVE' then
  return {'REVOKED', revokedReason}
end

-- 3. jti mismatch => stale/already-used refresh token => reuse attack
if storedJti ~= oldJti then
  --remove the session from set
  redis.call('SREM', userAllSession, sid)
  redis.call('HSET', sessionKey, 'status', 'REVOKED', 'reason', 'TOKEN_REUSE_DETECTION')

  return {'REVOKED', 'TOKEN_REUSE_DETECTED'}
end

-- 4 & 5. All good — rotate jti atomically and refresh TTL
redis.call('HSET', sessionKey, 'jti', newJti)
redis.call('EXPIRE', sessionKey, ttl)
redis.call('EXPIRE', userAllSession, ttl)

return {'ACTIVE', 'null'}
`
 
// Tell TypeScript about the new command ioredis just gained
declare module "ioredis" {
  interface RedisCommander<Context> {
    rotateSession(
      sessionKey: string,
      familySetKey: string,
      oldJti: string,
      newJti: string,
      ttlSeconds: number
    ): Promise<[string, string]>; // ["ok"|"err", "ROTATED"|"SESSION_NOT_FOUND"|...]
  }
}

// ─── Custom error types for the rotation outcomes ──────────────────────────────
 
export class SessionNotFoundError extends Error {}
export class SessionInactiveError extends Error {}
export class TokenReuseDetectedError extends Error {}


// function sessionKeyOf(family: string, sid: string) {
//   // {family} হলো Redis Cluster hash-tag — session key আর family-set key
//   // যেন একই hash slot-এ পড়ে, নাহলে cluster mode-এ multi-key Lua script ফেইল করবে
//   return `session:{${family}}:${sid}`;
// }
 
// function familySetKeyOf(family: string) {
//   return `family:{${family}}:sessions`;
// }


const KEYS = {
  session: (userId: string, sessionId: string) => `session:{${userId}}:${sessionId}`,
  userSessions: (userId: string) => `user-sessions:{${userId}}`,
};


// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "user" | "admin" | "moderator";

const accessTokenPayloadSchema = z.object({
  sub: z.string().trim().min(4),
  sid: z.string().trim().min(5),
  jti: z.string().trim().min(5),

  accountId: z.string().trim().min(4),
  deviceId: z.string().trim().min(4),

  role: z.enum(["user", "moderator", "admin"]),

  name: z.string().trim().min(3),
  email: z.string().trim().email(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

const refreshTokenPayloadSchema = z.object({
  sub: z.string().trim().min(4),

  sid: z.string().trim().min(5),
  jti: z.string().trim().min(5),

  accountId: z.string().trim().min(4),
  deviceId: z.string().trim().min(4),

  role: z.enum(["user", "moderator", "admin"]),
});

export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

// Input the caller provides — sid/jti/family are generated internally,
// so they should NOT be required from the caller.
// export type AccessTokenInput = Omit<AccessTokenPayload, "jti">;
// export type RefreshTokenInput = Omit<RefreshTokenPayload, "jti">;

export interface DecodedToken extends JwtPayload {
  sub: string;
  deviceId: string;
  accountId: string;
  role: Role;
}


export interface TokenServiceConfig {
  secret: string;
  refreshSecret: string;
  issuer?: string;
  audience?: string;
  accessTokenTTL?: SignOptions["expiresIn"]; // default: "15m"
  refreshTokenTTL?: SignOptions["expiresIn"]; // default: "7d"
}

// ─── Errors ───────────────────────────────────────────────────────────────────

export class TokenExpiredError extends Error {
  constructor(public expiredAt: Date) {
    super("Token has expired");
    this.name = "TokenExpiredError";
  }
}

export class TokenInvalidError extends Error {
  constructor(message = "Token is invalid") {
    super(message);
    this.name = "TokenInvalidError";
  }
}

const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days in seconds

// ─── Service ──────────────────────────────────────────────────────────────────

export class TokenService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly accessTokenTTL: SignOptions["expiresIn"];
  private readonly refreshTokenTTL: SignOptions["expiresIn"];



  constructor(
    config: TokenServiceConfig, 
    private readonly redisService: RedisService,
  ) {
    if (!config.secret || !config.refreshSecret) {
      throw new Error("TokenService: secrets must be non-empty strings");
    }

    this.secret = config.secret;
    this.refreshSecret = config.refreshSecret;
    this.issuer = config.issuer ?? "smreaz.com";
    this.audience = config.audience ?? "VibeIn_client";
    this.accessTokenTTL = config.accessTokenTTL ?? "15m";
    this.refreshTokenTTL = config.refreshTokenTTL ?? "7d";

  }

  private get client(): Redis | Cluster {
    return this.redisService.getClient()!;
  }

  // ── Generate ────────────────────────────────────────────────────────────────

  generateAccessToken(payload: AccessTokenPayload): string {
    const validated = this.validation(accessTokenPayloadSchema, payload);
    return this.sign(validated, this.secret, this.accessTokenTTL);
  }

  generateRefreshToken(payload: RefreshTokenPayload): string {
    const validated = this.validation(refreshTokenPayloadSchema, payload);
    return this.sign(validated, this.refreshSecret, this.refreshTokenTTL);
  }


  // ── Verify ──────────────────────────────────────────────────────────────────

  verifyAccessToken(token: string): AccessTokenPayload & JwtPayload {
    const decoded = this.verify(token, this.secret);
    return this.validation(accessTokenPayloadSchema, decoded) as AccessTokenPayload &
      JwtPayload;
  }

  verifyRefreshToken(token: string): RefreshTokenPayload & JwtPayload {
    const decoded = this.verify(token, this.refreshSecret);
    return this.validation(refreshTokenPayloadSchema, decoded) as RefreshTokenPayload &
      JwtPayload;
  }

  // ── Rotate ──────────────────────────────────────────────────────────────────
  
  async rotateTokens(refreshTokenPayload: RefreshTokenPayload):
    Promise<string | { status: string; reason: string }> 
  {
    const validated = this.validation(refreshTokenPayloadSchema, refreshTokenPayload);
    const newJti = randomUUID();

    const [status, reason] = await this.rotateSession({ ...refreshTokenPayload, newJti })

    if(status !== 'ACTIVE') return { status, reason };

    const newRefreshToken = this.generateRefreshToken({
      ...refreshTokenPayload,
      jti: newJti
    })

    return newRefreshToken;
    
  }

  // ── Decode (no verify) ──────────────────────────────────────────────────────

  decodeToken(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken | null;
    } catch {
      return null;
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private sign(
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: SignOptions["expiresIn"]
  ): string {
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn,
      notBefore: "0s",
      issuer: this.issuer,
      audience: this.audience,
    };

    try {
      return jwt.sign(payload, secret, options);
    } catch (err) {
      throw new Error(
        `TokenService: failed to sign token — ${(err as Error).message}`
      );
    }
  }

  private verify(token: string, secret: string): JwtPayload {
    const options: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: this.issuer,
      audience: this.audience,
    };

    try {
      return jwt.verify(token, secret, options) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError(err.expiredAt);
      }
      // Covers JsonWebTokenError (bad signature, malformed) & NotBeforeError
      throw new TokenInvalidError((err as Error).message);
    }
  }

  private async rotateSession(payload: RefreshTokenPayload & JwtPayload & { newJti: string }): Promise<[string, string]> {
    try {

      const { sid, newJti, sub: userId } = payload;

      const HASH_KEY = KEYS.session(userId, sid);
      const SET_KEY = KEYS.userSessions(userId);

      // ২) atomic session check + rotate — এটা Redis Lua script করে
      // return await rotateSessions({
      //   sessionKey: HASH_KEY,
      //   userAllSession: SET_KEY,
      //   sid,
      //   oldJti: payload.jti!,
      //   newJti,
      //   ttlSeconds: REFRESH_TTL_SECONDS,
      // });
      const [status, reason] = await this.client?.eval(luaRoateSession, 2, HASH_KEY, SET_KEY, sid, payload.jti!, newJti, REFRESH_TTL_SECONDS) as [string, string];
      return [status, reason];
     
    } catch (err) {

      if (err instanceof TokenReuseDetectedError) {
        // পুরো family revoke হয়ে গেছে — user-কে আবার login করতে হবে
        throw new TokenInvalidError(
          "Suspicious activity detected. Please log in again."
        );
      }
      if (err instanceof SessionNotFoundError || err instanceof SessionInactiveError) {
        throw new TokenInvalidError("Session no longer valid. Please log in again.");
      }
      throw err;

    }
  }

  private validation<T>(schema: z.ZodSchema<T>, payload: unknown): T {
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new TokenInvalidError("Invalid token payload");
    }

    return result.data;
  }
}

// ─── Singleton factory (recommended pattern for Next.js / Node) ───────────────

// let _instance: TokenService | null = null;

// export function getTokenService(): TokenService {
//   if (!_instance) {
//     const secret = process.env.NEXTAUTH_SECRET;
//     const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

//     if (!secret || !refreshSecret) {
//       throw new Error(
//         "Missing env vars: NEXTAUTH_SECRET and REFRESH_TOKEN_SECRET are required"
//       );
//     }

//     _instance = new TokenService( { secret, refreshSecret });
//   }

//   return _instance;
// }