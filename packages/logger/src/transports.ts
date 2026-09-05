import path from "node:path";
import type { TransportMultiOptions, TransportTargetOptions } from "pino";
import type { LoggerConfig } from "./config";

/**
 * transports.ts
 *
 * Decides WHERE logs go, based on environment:
 *
 * - development: pretty-printed, colorized, to stdout only.
 * - production/staging: raw NDJSON to stdout (so your log shipper —
 *   Promtail/Fluentd/CloudWatch agent — can pick it up), PLUS an
 *   optional rotating file if LOG_DIR is set. Never pretty-print in
 *   prod: it's synchronous-ish and defeats structured log parsing.
 *
 * pino-roll handles size + time based rotation with retention. It's
 * a peer dep — see package.json.
 */
export function buildTransport(cfg: LoggerConfig): TransportMultiOptions | undefined {
  const targets: TransportTargetOptions[] = [];

  if (cfg.LOG_PRETTY) {
    targets.push({
      target: "pino-pretty",
      level: cfg.LOG_LEVEL,
      options: {
        colorize: true,
        translateTime: "yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
        singleLine: false,
      },
    });
    // In dev, pretty stdout is the only sink — return early.
    return { targets };
  }

  // Production/staging: structured stdout, always.
  targets.push({
    target: "pino/file",
    level: cfg.LOG_LEVEL,
    options: { destination: 1 /* stdout */, sync: false },
  });

  // Optional rotating file sink alongside stdout — useful when you
  // don't yet have a log shipper and need on-disk history.
  if (cfg.LOG_DIR) {
    targets.push({
      target: "pino-roll",
      level: cfg.LOG_LEVEL,
      options: {
        file: path.join(cfg.LOG_DIR, cfg.LOG_FILE_NAME),
        size: `${cfg.LOG_MAX_SIZE_MB}m`,
        limit: { count: cfg.LOG_MAX_FILES },
        mkdir: true,
      },
    });
  }

  return { targets };
}
