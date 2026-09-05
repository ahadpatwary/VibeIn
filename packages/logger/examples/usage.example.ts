import "reflect-metadata";
import { container, inject, injectable } from "tsyringe";
import { registerLogger, shutdownLogger, LOGGER_TOKENS, correlationIdMiddleware, LoggerFactory } from "../src";
import type { ILogger } from "../src";

// ── 1. Bootstrap (once, at app startup) ────────────────────────────
registerLogger(); // binds ILogger -> PinoLoggerAdapter in the root container

// ── 2. Any service just depends on ILogger via LoggerFactory ───────
@injectable()
class OrderService {
  private readonly logger: ILogger;

  constructor(@inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory) {
    this.logger = factory.forModule("OrderService");
  }

  async placeOrder(orderId: string) {
    this.logger.info("Placing order", { orderId });
    try {
      // ... business logic
    } catch (err) {
      // `err` can be a plain Error or your AppError subclass —
      // code/namespace/statusCode are picked up automatically.
      this.logger.error("Failed to place order", err, { orderId });
      throw err;
    }
  }
}

const orderService = container.resolve(OrderService);
void orderService.placeOrder("ord_123");

// ── 3. Express: tag every log line in a request with a correlation id
// app.use(correlationIdMiddleware());

// ── 4. Graceful shutdown ────────────────────────────────────────────
process.on("SIGTERM", async () => {
  await shutdownLogger();
  process.exit(0);
});
