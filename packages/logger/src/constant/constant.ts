import type { PinoConfig } from '../types/types';

export const pinoConstConfig: PinoConfig = {
   // level: LOG_LEVEL,
   // base: {
   //   service: cfg.SERVICE_NAME,
   //   env: cfg.NODE_ENV,
   //   version: cfg.APP_VERSION,
   //   pid: process.pid,
   // },
   // timestamp: pino.stdTimeFunctions.isoTime,
   // redact: {
   //   paths: buildRedactPaths(cfg.LOG_REDACT_PATHS),
   //   censor: "[REDACTED]",
   // },
   // formatters: {
   //   // Keep level as a string ("info") instead of pino's default
   //   // numeric level — massively improves readability in raw
   //   // NDJSON log viewers (CloudWatch, Loki, etc).
   //   level: (label) => ({ level: label }),
   // },
   // serializers: {
   //   err: pino.stdSerializers.err,
   // },
   // transport: buildTransport(cfg),
};
