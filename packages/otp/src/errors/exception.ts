export class CooldownError extends Error {
   readonly name = 'CooldownError';
   constructor(
      message: string,
      public readonly waitSeconds: number,
   ) {
      super(message);
   }
}

export class ConcurrentRequestError extends Error {
   readonly name = 'ConcurrentRequestError';
   constructor() {
      super('Another OTP request is already in progress. Try again shortly.');
   }
}

export class ValidationError extends Error {
   readonly name = 'ValidationError';
   constructor(message: string) {
      super(message);
   }
}
