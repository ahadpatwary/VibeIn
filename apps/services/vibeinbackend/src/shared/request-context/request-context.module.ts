import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { RequestContextService } from './request-context.service';
import { RequestContextMiddleware } from './request-context.middleware';

@Module({
   providers: [RequestContextService],

   exports: [RequestContextService],
})
export class RequestContextModule implements NestModule {
   configure(consumer: MiddlewareConsumer): void {
      consumer.apply(RequestContextMiddleware).forRoutes('*');
   }
}
