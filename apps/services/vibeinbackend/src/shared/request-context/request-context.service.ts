import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { RequestContextType } from './request-context.types';

@Injectable()
export class RequestContextService {
   private readonly storage = new AsyncLocalStorage<RequestContextType>();

   run<T>(context: RequestContextType, callback: () => T): T {
      return this.storage.run(context, callback);
   }

   get(): RequestContextType {
      const context = this.storage.getStore();

      if (!context) {
         throw new InternalServerErrorException('Request context is not available');
      }

      return context;
   }

   getRequestId(): string {
      return this.get().requestId;
   }
}
