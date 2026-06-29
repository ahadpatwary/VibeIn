import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "user" | "admin" | "moderator";

export interface TokenPayload {
  sub: string;       // userId
  deviceId: string;
  accountId: string;
  role: Role;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenServiceConfig {
  secret: string;
  refreshSecret: string;
  issuer?: string;
  audience?: string;
  accessTokenTTL?: SignOptions["expiresIn"];   // default: "15m"
  refreshTokenTTL?: SignOptions["expiresIn"];  // default: "7d"
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

// ─── Service ──────────────────────────────────────────────────────────────────

export class TokenService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly accessTokenTTL: SignOptions["expiresIn"];
  private readonly refreshTokenTTL: SignOptions["expiresIn"];

  constructor(config: TokenServiceConfig) {
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

  // ── Generate ────────────────────────────────────────────────────────────────

  /** Signs and returns an access token. Throws on signing failure. */
  generateAccessToken(payload: TokenPayload): string {
    return this.sign(payload, this.secret, this.accessTokenTTL);
  }

  /** Signs and returns a refresh token (longer-lived, different secret). */
  generateRefreshToken(payload: TokenPayload): string {
    return this.sign(payload, this.refreshSecret, this.refreshTokenTTL);
  }

  /** Convenience: returns both tokens at once. */
  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // ── Verify ──────────────────────────────────────────────────────────────────

  /**
   * Verifies an access token.
   * @throws {TokenExpiredError} if the token is expired.
   * @throws {TokenInvalidError} if the token is malformed / signature mismatch.
   */
  verifyAccessToken(token: string): DecodedToken {
    return this.verify(token, this.secret);
  }

  /**
   * Verifies a refresh token.
   * @throws {TokenExpiredError} if the token is expired.
   * @throws {TokenInvalidError} if the token is malformed / signature mismatch.
   */
  verifyRefreshToken(token: string): DecodedToken {
    return this.verify(token, this.refreshSecret);
  }

  // ── Rotate ──────────────────────────────────────────────────────────────────

  /**
   * Validates the refresh token and issues a fresh token pair.
   * Use this in your refresh-token endpoint.
   *
   * @throws {TokenExpiredError | TokenInvalidError}
   */
  rotateTokens(refreshToken: string): TokenPair {
    const decoded = this.verifyRefreshToken(refreshToken);

    const payload: TokenPayload = {
      sub: decoded.sub!,
      deviceId: decoded.deviceId,
      accountId: decoded.accountId,
      role: decoded.role,
    };

    return this.generateTokenPair(payload);
  }

  // ── Decode (no verify) ──────────────────────────────────────────────────────

  /**
   * Decodes a token WITHOUT verifying signature or expiry.
   * Safe only for reading non-sensitive claims (e.g. extracting `sub` before
   * fetching the user from DB to do a full verify).
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken | null;
    } catch {
      return null;
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private sign(
    payload: TokenPayload,
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
      // jwt.sign with a callback is async; the sync overload returns string.
      return jwt.sign(payload, secret, options);
    } catch (err) {
      throw new Error(
        `TokenService: failed to sign token — ${(err as Error).message}`
      );
    }
  }

  private verify(token: string, secret: string): DecodedToken {
    const options: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: this.issuer,
      audience: this.audience,
    };

    try {
      return jwt.verify(token, secret, options) as DecodedToken;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new TokenExpiredError(err.expiredAt);
      }
      // Covers JsonWebTokenError (bad signature, malformed) & NotBeforeError
      throw new TokenInvalidError((err as Error).message);
    }
  }
}

// ─── Singleton factory (recommended pattern for Next.js / Node) ───────────────

let _instance: TokenService | null = null;

export function getTokenService(): TokenService {
  if (!_instance) {
    const secret = process.env.NEXTAUTH_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret || !refreshSecret) {
      throw new Error(
        "Missing env vars: NEXTAUTH_SECRET and REFRESH_TOKEN_SECRET are required"
      );
    }

    _instance = new TokenService({ secret, refreshSecret });
  }

  return _instance;
}