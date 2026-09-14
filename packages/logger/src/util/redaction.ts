/**
 * redaction.ts
 *
 * Fields that must NEVER appear in logs in plaintext, regardless of
 * where in the meta object they show up. Pino's `redact` walks these
 * paths (with wildcard support) and replaces the value with
 * "[REDACTED]" before serialization — the original object passed by
 * the caller is untouched.
 *
 * This list is a floor, not a ceiling: LOG_REDACT_PATHS (config.ts)
 * can only ADD paths, never remove these.
 */
export const DEFAULT_REDACT_PATHS: string[] = [
  "password",
  "*.password",
  "confirmPassword",
  "*.confirmPassword",
  "token",
  "*.token",
  "accessToken",
  "*.accessToken",
  "refreshToken",
  "*.refreshToken",
  "authorization",
  "*.authorization",
  "req.headers.authorization",
  "req.headers.cookie",
  "cookie",
  "*.cookie",
  "apiKey",
  "*.apiKey",
  "secret",
  "*.secret",
  "creditCard",
  "*.creditCard",
  "cardNumber",
  "*.cardNumber",
  "cvv",
  "*.cvv",
  "ssn",
  "*.ssn",
  "otp",
  "*.otp",
];

export function buildRedactPaths(extra: string[] = []): string[] {
  return Array.from(new Set([...DEFAULT_REDACT_PATHS, ...extra]));
}
