import { inject, injectable, singleton } from "tsyringe";
import type { ILogger } from "./types";
import { LOGGER_TOKENS } from "./tokens";

/**
 * LoggerFactory.ts
 *
 * Services shouldn't inject the raw root ILogger — they should get a
 * logger scoped to their own module name, so every line they emit is
 * automatically tagged (e.g. { module: "OrderService" }) without
 * remembering to pass it every call.
 *
 * Usage inside a service:
 *
 *   @injectable()
 *   class OrderService {
 *     private readonly logger: ILogger;
 *     constructor(@inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory) {
 *       this.logger = factory.forModule("OrderService");
 *     }
 *   }
 */
@injectable()
@singleton()
export class LoggerFactory {
  private readonly cache = new Map<string, ILogger>();

  constructor(@inject(LOGGER_TOKENS.Logger) private readonly rootLogger: ILogger) {}

  forModule(moduleName: string, extraBindings: Record<string, unknown> = {}): ILogger {
    const cacheKey = moduleName + JSON.stringify(extraBindings);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const scoped = this.rootLogger.child({ module: moduleName, ...extraBindings });
    this.cache.set(cacheKey, scoped);
    return scoped;
  }
}
