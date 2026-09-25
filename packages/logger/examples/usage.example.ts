import 'reflect-metadata';

import { container, inject, injectable } from 'tsyringe';

import type { ILogger } from '../src';
import { LOGGER_TOKENS, LoggerFactory, registerLogger, shutdownLogger } from '../src';

/**
 *  Bootstrap (once, at app startup)
 */
registerLogger(container, {});

@injectable()
class OrderService {
   private readonly logger: ILogger;

   constructor(@inject(LOGGER_TOKENS.LoggerFactory) factory: LoggerFactory) {
      this.logger = factory.forModule('OrderService');
   }

   async placeOrder(orderId: string) {
      this.logger.info('Placing order', { orderId });
      try {
         // ... business logic
      } catch (err) {
         // `err` can be a plain Error or your AppError subclass —
         // code/namespace/statusCode are picked up automatically.
         this.logger.error('Failed to place order', err, { orderId });
         throw err;
      }
   }
}

const orderService = container.resolve(OrderService);
void orderService.placeOrder('ord_123');

// ── 3. Express: tag every log line in a request with a correlation id
// app.use(correlationIdMiddleware());

// ── 4. Graceful shutdown ────────────────────────────────────────────
process.on('SIGTERM', async () => {
   await shutdownLogger();
   process.exit(0);
});
