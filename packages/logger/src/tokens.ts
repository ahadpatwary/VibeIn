/**
 * tokens.ts
 *
 * Symbol-based tokens, consistent with the rest of the app's tsyringe
 * DI convention. Services never import PinoLoggerAdapter directly —
 * they @inject(LOGGER_TOKENS.Logger) and depend only on ILogger.
 */
export const LOGGER_TOKENS = {
  Logger: Symbol.for("ILogger"),
  LoggerConfig: Symbol.for("LoggerConfig"),
  LoggerFactory: Symbol.for("LoggerFactory"),
} as const;
