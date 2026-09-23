// import { z } from "zod";
import {  PinoConfig } from "../types/types";
import { pinoConstConfig } from "../constant/constant";



let cachedConfig: PinoConfig | null = null;

export function loadLoggerConfig(cfg: PinoConfig): PinoConfig {
  if (cachedConfig) return cachedConfig;


  cachedConfig = {
    ...pinoConstConfig, // constent value
                        // parsed required data
  }


  return cachedConfig;
}

/** Test/tooling escape hatch — never call this from application code. */
export function __resetLoggerConfigCache(): void {
  cachedConfig = null;
}


// const parsed = LoggerConfigSchema.safeParse(cfg);

// if (!parsed.success) {
//   throw new Error(`Invalid logger configuration: ${parsed.error.toString()}`);
// }