export class TokenExpiredError extends Error {
   constructor(public expiredAt: Date) {
      super('Token has expired');
      this.name = 'TokenExpiredError';
   }
}

export class TokenInvalidError extends Error {
   constructor(message = 'Token is invalid') {
      super(message);
      this.name = 'TokenInvalidError';
   }
}
