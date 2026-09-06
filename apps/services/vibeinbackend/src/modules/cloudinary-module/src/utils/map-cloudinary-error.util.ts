import {
  CloudinaryAssetNotFoundException,
  CloudinaryDeleteException,
  CloudinaryException,
  CloudinaryRateLimitException,
  CloudinaryUpdateException,
  CloudinaryUploadException,
} from '../exceptions/cloudinary.exception';

type CloudinaryOperation = 'upload' | 'delete' | 'update';

interface CloudinarySdkError {
  http_code?: number;
  message?: string;
  error?: { message?: string; http_code?: number };
}

/**
 * Translates raw Cloudinary SDK errors (which are loosely-typed, sometimes
 * nested under `.error`, sometimes flat) into our internal exception
 * hierarchy. This is the single place that understands Cloudinary's
 * error shape — nothing else in the module should touch raw SDK errors.
 */
export function mapCloudinaryError(
  err: unknown,
  operation: CloudinaryOperation,
  publicId?: string,
): CloudinaryException {
  const sdkErr = normalizeSdkError(err);
  const httpCode = sdkErr.http_code;
  const message = sdkErr.message ?? 'Unknown Cloudinary error';

  if (httpCode === 404) {
    return new CloudinaryAssetNotFoundException(publicId ?? 'unknown', {
      originalCode: httpCode,
      cause: err,
    });
  }

  if (httpCode === 420 || httpCode === 429) {
    return new CloudinaryRateLimitException(
      `Cloudinary rate limit hit during ${operation}: ${message}`,
      { originalCode: httpCode, cause: err, retriesExhausted: true },
    );
  }

  const meta = { originalCode: httpCode, cause: err, publicId };

  switch (operation) {
    case 'upload':
      return new CloudinaryUploadException(
        `Cloudinary upload failed: ${message}`,
        meta,
      );
    case 'delete':
      return new CloudinaryDeleteException(
        `Cloudinary delete failed: ${message}`,
        meta,
      );
    case 'update':
      return new CloudinaryUpdateException(
        `Cloudinary update failed: ${message}`,
        meta,
      );
  }
}

function normalizeSdkError(err: unknown): CloudinarySdkError {
  if (err && typeof err === 'object') {
    const e = err as CloudinarySdkError;
    if (e.error) {
      return { http_code: e.error.http_code ?? e.http_code, message: e.error.message ?? e.message };
    }
    return { http_code: e.http_code, message: e.message };
  }
  return { message: err instanceof Error ? err.message : String(err) };
}

export function extractHttpCode(err: unknown): number | undefined {
  return normalizeSdkError(err).http_code;
}
