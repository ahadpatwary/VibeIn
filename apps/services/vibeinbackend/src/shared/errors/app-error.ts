export interface AppErrorOptions {
   code: string;
   message: string;
   details?: unknown;
   statusCode?: number;
}

export class AppError extends Error {
   readonly code: string;
   readonly details: unknown;
   readonly statusCode: number;

   constructor(options: AppErrorOptions) {
      super(options.message);

      this.name = 'AppError';

      this.code = options.code;
      this.details = options.details ?? null;
      this.statusCode = options.statusCode ?? 500;
   }
}
