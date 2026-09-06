/**
 * Symbol-based DI tokens — avoids string-token collisions across modules
 * and gives you compile-time-safe injection points.
 */
export const CLOUDINARY_MODULE_OPTIONS = Symbol('CLOUDINARY_MODULE_OPTIONS');
export const CLOUDINARY_CLIENT = Symbol('CLOUDINARY_CLIENT');

export const CLOUDINARY_DEFAULT_FOLDER = 'uploads';

/** Per resource-type allow-lists and size caps (bytes). Tune per project. */
export const CLOUDINARY_FILE_LIMITS = {
  image: {
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  },
  video: {
    maxSizeBytes: 200 * 1024 * 1024, // 200MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'],
  },
  audio: {
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a'],
  },
} as const;

/** HTTP/Cloudinary error codes considered transient -> safe to retry. */
export const RETRYABLE_HTTP_CODES = new Set([408, 420, 429, 500, 502, 503, 504]);
