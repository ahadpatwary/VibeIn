# @app/logger

Production-ready structured logger. Pino under the hood, but no service
in the application imports `pino` directly — everything depends on the
`ILogger` interface, injected via `tsyringe`.

## Why it's built this way

```
types.ts            <- ILogger contract (the ONLY thing services depend on)
config.ts            <- Zod-validated env config, fails fast at boot
tokens.ts             <- Symbol DI tokens
redaction.ts           <- sensitive-field redact paths (password, token, etc.)
transports.ts            <- dev pretty-print vs prod stdout+rotating file
context.ts                 <- AsyncLocalStorage correlation id propagation
adapters/PinoLoggerAdapter.ts <- the ONLY file that imports `pino`
LoggerFactory.ts                <- module-scoped child loggers
container.ts                     <- the ONE binding: ILogger -> PinoLoggerAdapter
```

**To swap Pino for something else later:** write `WinstonLoggerAdapter
implements ILogger`, change one line in `container.ts`. Nothing else
in the codebase changes — every service already depends on `ILogger`,
never on Pino.

## Production behavior

- **development**: colorized pretty-print to stdout (`pino-pretty`).
- **production/staging**: raw NDJSON to stdout (for your log shipper —
  Loki/Fluentd/CloudWatch agent), plus an optional rotating file sink
  if `LOG_DIR` is set (size + retention via `pino-roll`).
- **redaction**: `password`, `token`, `authorization`, `cookie`,
  `cardNumber`, `otp`, etc. are redacted by default, wherever they
  appear in the meta object — extend via `LOG_REDACT_PATHS`, never
  remove the defaults.
- **correlation ids**: `correlationIdMiddleware()` opens an
  `AsyncLocalStorage` scope per request; every log line emitted
  anywhere during that request — no matter how deep — is auto-tagged
  with `correlationId`/`requestId` without passing them manually.
- **error logging**: `logger.error(msg, err, meta)` serializes
  `Error` instances properly (stack, message) and also picks up
  `code` / `namespace` / `statusCode` / `isOperational` if present —
  works out of the box with an `AppError` hierarchy.
- **graceful shutdown**: `await shutdownLogger()` flushes buffered
  transports before `process.exit`, call it in your `SIGTERM`/`SIGINT`
  handler after you stop accepting new work.

## Usage

```ts
registerLogger(); // once, at bootstrap

@injectable()
class OrderService {
  private readonly logger: ILogger;
  constructor(@inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory) {
    this.logger = factory.forModule("OrderService");
  }
}
```

See `examples/usage.example.ts` for the full wiring including Express
middleware and shutdown handling.

## Env vars

See `.env.example`.
