/**
 * types.ts
 *
 * ILogger is the ONLY contract the rest of the application depends on.
 * Every service injects ILogger via the LOGGER token — never a concrete
 * Pino type. Swapping Pino for Winston/Bunyan/anything else later means
 * writing a new class that implements ILogger and rebinding the DI
 * token in container.ts. No call-site in any service changes.
*/

export enum LogLevel {
  FATAL = "fatal",
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

/**
 * Arbitrary structured metadata attached to a log line.
 * Keep this JSON-serializable — no class instances, no circular refs.
 */
export type LogMeta = Record<string, unknown>;

/**
 * Every log line's fixed context (added automatically, never passed by callers).
 */
export interface LoggerBaseContext {
  service: string;
  env: string;
  version?: string;
  hostname?: string;
  pid?: number;
}

/**
 * Per-request / per-async-scope context (correlation id, user id, etc).
 * Populated via AsyncLocalStorage — see context.ts.
 */
export interface RequestContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface ILogger {
  fatal(message: string, meta?: LogMeta): void;
  error(message: string, error?: unknown, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  debug(message: string, meta?: LogMeta): void;
  trace(message: string, meta?: LogMeta): void;

  /**
   * Returns a new logger with `bindings` merged into every subsequent
   * log line. Used to scope a logger to a module/service/request
   * without re-passing context on every call.
   */
  child(bindings: LogMeta): ILogger;

  /**
   * Flush any buffered/async transports before process exit.
   * Must be awaited during graceful shutdown (SIGTERM/SIGINT).
   */
  flush(): Promise<void>;
}
