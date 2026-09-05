import { container, type DependencyContainer } from "tsyringe";
import { LOGGER_TOKENS } from "./tokens";
import { loadLoggerConfig, type LoggerConfig } from "./config";
import { PinoLoggerAdapter } from "./adapters/PinoLoggerAdapter";
import { LoggerFactory } from "./LoggerFactory";
import type { ILogger } from "./types";

/**
 * container.ts
 *
 * THE ONLY PLACE THAT BINDS ILogger TO A CONCRETE IMPLEMENTATION.
 *
 * To swap Pino for something else later:
 *   1. Write NewLoggerAdapter implements ILogger.
 *   2. Change the one registerInstance/registerSingleton call below.
 * Nothing else in the app changes — every service still depends on
 * ILogger via LOGGER_TOKENS.Logger.
 */
export function registerLogger(targetContainer: DependencyContainer = container, config?: LoggerConfig): void {
  const cfg = config ?? loadLoggerConfig();

  targetContainer.registerInstance<LoggerConfig>(LOGGER_TOKENS.LoggerConfig, cfg);

  // Root logger is a true singleton: one Pino instance, one set of
  // open file/stdout handles, for the lifetime of the process.
  const rootLogger: ILogger = new PinoLoggerAdapter(cfg);
  targetContainer.registerInstance<ILogger>(LOGGER_TOKENS.Logger, rootLogger);

  targetContainer.registerSingleton(LOGGER_TOKENS.LoggerFactory, LoggerFactory);
}

/**
 * Call during SIGTERM/SIGINT handling, after you stop accepting new
 * work but before process.exit — makes sure buffered log lines
 * (file transport, async stdout) actually get written.
 */
export async function shutdownLogger(targetContainer: DependencyContainer = container): Promise<void> {
  const logger = targetContainer.resolve<ILogger>(LOGGER_TOKENS.Logger);
  await logger.flush();
}
