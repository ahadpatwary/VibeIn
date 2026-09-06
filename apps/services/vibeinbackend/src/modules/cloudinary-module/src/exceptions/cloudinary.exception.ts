import { HttpException, HttpStatus } from '@nestjs/common';

export interface CloudinaryExceptionMeta {
  /** Original Cloudinary/HTTP error code, if available. */
  originalCode?: number | string;
  /** Whether the operation that threw this was already retried and still failed. */
  retriesExhausted?: boolean;
  publicId?: string;
  cause?: unknown;
}

/**
 * Base of the Cloudinary exception hierarchy. Never thrown directly —
 * always throw one of the subclasses so callers/filters can branch on type.
 */
export abstract class CloudinaryException extends HttpException {
  public readonly meta: CloudinaryExceptionMeta;

  protected constructor(
    message: string,
    status: HttpStatus,
    meta: CloudinaryExceptionMeta = {},
  ) {
    super({ statusCode: status, message, error: new.target.name }, status);
    this.meta = meta;
    this.name = new.target.name;
  }
}

export class CloudinaryConfigException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, meta);
  }
}

export class CloudinaryUploadException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.BAD_GATEWAY, meta);
  }
}

export class CloudinaryDeleteException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.BAD_GATEWAY, meta);
  }
}

export class CloudinaryUpdateException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.BAD_GATEWAY, meta);
  }
}

export class CloudinarySignatureException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, meta);
  }
}

export class CloudinaryAssetNotFoundException extends CloudinaryException {
  constructor(publicId: string, meta?: CloudinaryExceptionMeta) {
    super(`Asset not found: ${publicId}`, HttpStatus.NOT_FOUND, {
      ...meta,
      publicId,
    });
  }
}

export class CloudinaryValidationException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, meta);
  }
}

/** Thrown when Cloudinary rate-limits us and retries are also exhausted. */
export class CloudinaryRateLimitException extends CloudinaryException {
  constructor(message: string, meta?: CloudinaryExceptionMeta) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, meta);
  }
}
