import pino, { type Logger as PinoInstance } from 'pino';
import { injectable } from 'tsyringe';

import { getRequestContext } from '../context';
import type { ILogger, LogMeta, PinoConfig } from '../types/types';

/**
 * PinoLoggerAdapter.ts
 *
 * The ONLY place in the entire logger module that touches the `pino`
 * package directly. Every other file talks to ILogger. If Pino is
 * ever replaced (Winston, Bunyan, a custom transport, whatever),
 * this is the one file that gets rewritten — write a new class that
 * implements ILogger and rebind LOGGER_TOKENS.Logger in container.ts.
 * No service code changes.
 *
 * Not decorated @singleton() here on purpose — singleton lifetime is
 * decided in container.ts where the binding happens, keeping this
 * class reusable for both the root logger and ad-hoc child loggers.
 */
@injectable()
export class PinoLoggerAdapter implements ILogger {
   private readonly pino: PinoInstance;

   constructor(configOrInstance: PinoConfig | PinoInstance) {
      this.pino = isPinoInstance(configOrInstance)
         ? configOrInstance
         : PinoLoggerAdapter.createRootInstance(configOrInstance);
   }

   private static createRootInstance(cfg: PinoConfig): PinoInstance {
      return pino(cfg);
   }

   #mergedMeta(meta?: LogMeta): LogMeta {
      // Auto-attach request-scoped context (correlationId, userId...)
      // set by context.ts — callers never pass this manually.
      const requestContext = getRequestContext();
      if (!meta && Object.keys(requestContext).length === 0) return {};
      return { ...requestContext, ...meta };
   }

   fatal(message: string, meta?: LogMeta): void {
      this.pino.fatal(this.#mergedMeta(meta), message);
   }

   error(message: string, error?: unknown, meta?: LogMeta): void {
      const errPayload = error !== undefined ? { err: normalizeError(error) } : {};
      this.pino.error({ ...this.#mergedMeta(meta), ...errPayload }, message);
   }

   warn(message: string, meta?: LogMeta): void {
      this.pino.warn(this.#mergedMeta(meta), message);
   }

   info(message: string, meta?: LogMeta): void {
      this.pino.info(this.#mergedMeta(meta), message);
   }

   debug(message: string, meta?: LogMeta): void {
      this.pino.debug(this.#mergedMeta(meta), message);
   }

   trace(message: string, meta?: LogMeta): void {
      this.pino.trace(this.#mergedMeta(meta), message);
   }

   child(bindings: LogMeta): ILogger {
      return new PinoLoggerAdapter(this.pino.child(bindings));
   }

   async flush(): Promise<void> {
      await new Promise<void>((resolve, reject) => {
         this.pino.flush((err) => (err ? reject(err) : resolve()));
      });
   }
}

function isPinoInstance(value: unknown): value is PinoInstance {
   return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as PinoInstance).child === 'function' &&
      typeof (value as PinoInstance).bindings === 'function'
   );
}

/**
 * Normalizes anything thrown (Error, AppError subclasses with
 * .code/.namespace, or a non-Error value) into a plain object pino
 * can serialize safely. Duck-typed on purpose — this module has no
 * dependency on your application's AppError hierarchy.
 */
function normalizeError(error: unknown): Record<string, unknown> {
   if (error instanceof Error) {
      const extra: Record<string, unknown> = {};
      for (const key of ['code', 'namespace', 'statusCode', 'isOperational', 'cause'] as const) {
         if (key in error) extra[key] = (error as unknown as Record<string, unknown>)[key];
      }
      return { ...pino.stdSerializers.err(error), ...extra };
   }
   return { message: 'Non-Error value thrown', value: safeStringify(error) };
}

function safeStringify(value: unknown): string {
   try {
      return JSON.stringify(value);
   } catch {
      return String(value);
   }
}
