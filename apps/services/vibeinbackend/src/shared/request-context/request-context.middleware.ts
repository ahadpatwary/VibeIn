import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestContextType, clientMetaDataSchema } from './request-context.types';
import { HeaderOptions } from './request-context.constant';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
   constructor(private readonly requestContext: RequestContextService) {}

   use(req: Request, res: Response, next: NextFunction): void {
      const requestId = this.getRequestId(req);

      const client = {
         deviceId: this.getHeader(req, HeaderOptions.DEVICE_ID),

         clientType: this.getHeader(req, HeaderOptions.CLIENT_TYPE),

         appVersion: this.getHeader(req, HeaderOptions.APP_VERSION),

         userAgent: req.get('user-agent') ?? undefined,

         ip: req.ip ?? undefined,
      };

      const data = clientMetaDataSchema.safeParse(client);

      if (!data.success) {
         res.status(400).json({
            message: 'Invalid client metadata',
            errors: data.error,
         });
         return;
      }

      const context: RequestContextType = {
         requestId,
         ...data.data,
      };

      res.setHeader('X-Request-Id', requestId);

      this.requestContext.run(context, () => next());
   }

   private getRequestId(req: Request): string {
      const incoming = this.getHeader(req, 'x-request-id');

      return incoming ?? randomUUID();
   }

   private getHeader(req: Request, name: string): string | undefined {
      const value = req.get(name);

      if (!value) {
         return undefined;
      }

      return value.trim() || undefined;
   }
}
