import { z } from "zod";
import { LogLevel } from "./types";

/**
 * config.ts
 *
 * Zod schema + loader for logger configuration. Fails fast at boot
 * (throws) if env vars are missing/invalid instead of silently
 * falling back to bad defaults in production.
 */

const LoggerConfigSchema = z.object({
  SERVICE_NAME: z.string().min(1, "SERVICE_NAME is required"),
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_VERSION: z.string().optional(),

  LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.INFO),

  // Pretty-print to stdout (dev only — never in prod, it's slow and
  // not machine-parseable). Auto-forced off when NODE_ENV=production.
  LOG_PRETTY: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  // File transport (rotating). Leave unset to log to stdout only
  // (recommended when your infra ships stdout to a log collector —
  // Loki/CloudWatch/ELK — which is the standard production pattern).
  LOG_DIR: z.string().optional(),
  LOG_FILE_NAME: z.string().default("app.log"),
  LOG_MAX_SIZE_MB: z.coerce.number().positive().default(50),
  LOG_MAX_FILES: z.coerce.number().int().positive().default(14),

  // Redaction — comma separated pino redact paths, merged with the
  // built-in defaults in redaction.ts (never disable those defaults).
  LOG_REDACT_PATHS: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()) : [])),
});

export type LoggerConfig = z.infer<typeof LoggerConfigSchema> & {
  isProduction: boolean;
};

let cachedConfig: LoggerConfig | null = null;

export function loadLoggerConfig(env: NodeJS.ProcessEnv = process.env): LoggerConfig {
  if (cachedConfig) return cachedConfig;

  const parsed = LoggerConfigSchema.safeParse(env);
  if (!parsed.success) {
    // Intentionally thrown, not logged — the logger itself isn't
    // built yet, this is a boot-time fatal.
    throw new Error(`Invalid logger configuration: ${parsed.error.toString()}`);
  }

  const isProduction = parsed.data.NODE_ENV === "production";

  cachedConfig = {
    ...parsed.data,
    // Pretty printing is force-disabled in production regardless of
    // the env var — this is a safety rail, not a suggestion.
    LOG_PRETTY: parsed.data.LOG_PRETTY && !isProduction,
    isProduction,
  };

  return cachedConfig;
}

/** Test/tooling escape hatch — never call this from application code. */
export function __resetLoggerConfigCache(): void {
  cachedConfig = null;
}
