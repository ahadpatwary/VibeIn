import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type { RequestContext } from "./types";

/**
 * context.ts
 *
 * Carries per-request context (correlationId, userId, etc.) across
 * async boundaries WITHOUT threading it through every function
 * signature. The Logger reads from this store automatically and
 * merges it into every log line — this is how a single log statement
 * deep in a service ends up tagged with the request that triggered it.
 */
const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext {
  return storage.getStore() ?? {};
}

export function updateRequestContext(patch: Partial<RequestContext>): void {
  const current = storage.getStore();
  if (current) Object.assign(current, patch);
}

/**
 * Express/Koa-style middleware. Wraps every request in its own
 * AsyncLocalStorage scope with a correlation id (reused from an
 * inbound header if present, so it survives across service hops).
 */
export function correlationIdMiddleware(headerName = "x-correlation-id") {
  return (req: any, res: any, next: () => void) => {
    const incoming = req.headers?.[headerName];
    const correlationId = typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();

    res.setHeader?.(headerName, correlationId);

    runWithRequestContext({ correlationId, requestId: randomUUID() }, () => {
      next();
    });
  };
}
