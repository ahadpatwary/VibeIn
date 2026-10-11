import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { RequestContextService } from './request-context.service';
import { RequestContextMiddleware } from './request-context.middleware';
import { REQUEST_CONTEXT } from './request-context.token';

@Module({
   providers: [
      {
         provide: REQUEST_CONTEXT,
         useClass: RequestContextService,
      },
   ],

   exports: [REQUEST_CONTEXT],
})
export class RequestContextModule implements NestModule {
   configure(consumer: MiddlewareConsumer): void {
      consumer.apply(RequestContextMiddleware).forRoutes('*');
   }
}
