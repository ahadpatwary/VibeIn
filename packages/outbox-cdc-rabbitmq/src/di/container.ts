import "reflect-metadata";
import { container } from "tsyringe";
import { DI_TOKENS } from "./tokens";

export function registerCoreDependencies(serviceName: string): void {
  container.registerInstance(DI_TOKENS.Logger, console);
  container.registerInstance(DI_TOKENS.ServiceName, serviceName);
}

export { container };
