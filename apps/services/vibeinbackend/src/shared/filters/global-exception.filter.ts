import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

import type { Request, Response } from 'express';
import { AppError } from '../errors/app-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
   catch(exception: unknown, host: ArgumentsHost): void {
      const context = host.switchToHttp();

      const request = context.getRequest<Request>();

      const response = context.getResponse<Response>();

      const requestId = request.headers['x-request-id'];

      const normalizedRequestId = typeof requestId === 'string' ? requestId : null;

      const error = this.normalizeException(exception);

      response.status(error.statusCode).json({
         success: false,

         error: {
            code: error.code,
            message: error.message,
            details: error.details,
            requestId: normalizedRequestId,
         },
      });
   }

   private normalizeException(exception: unknown): {
      statusCode: number;
      code: string;
      message: string;
      details: unknown;
   } {
      /** Our custom given errors */
      if (exception instanceof AppError) {
         return {
            statusCode: exception.statusCode,
            code: exception.code,
            message: exception.message,
            details: exception.details,
         };
      }

      /** Nestjs given errors */
      if (exception instanceof HttpException) {
         const statusCode = exception.getStatus();

         return {
            statusCode,
            code: this.getHttpErrorCode(statusCode),
            message: this.getSafeHttpMessage(exception),
            details: null,
         };
      }

      /** Unknown/unexpected errors */
      return {
         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
         code: 'INTERNAL_SERVER_ERROR',
         message: 'An unexpected error occurred.',
         details: null,
      };
   }

   private getHttpErrorCode(statusCode: number): string {
      switch (statusCode) {
         case 400:
            return 'BAD_REQUEST';

         case 401:
            return 'UNAUTHORIZED';

         case 403:
            return 'FORBIDDEN';

         case 404:
            return 'NOT_FOUND';

         case 409:
            return 'CONFLICT';

         case 422:
            return 'VALIDATION_ERROR';

         case 429:
            return 'TOO_MANY_REQUESTS';

         default:
            return 'HTTP_ERROR';
      }
   }

   private getSafeHttpMessage(exception: HttpException): string {
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null && 'message' in response) {
         const message = response.message;

         if (typeof message === 'string') {
            return message;
         }

         if (Array.isArray(message)) {
            return 'Request validation failed.';
         }
      }

      return exception.message;
   }
}
