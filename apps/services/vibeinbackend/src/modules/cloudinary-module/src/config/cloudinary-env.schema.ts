import { z } from 'zod';

/**
 * Strict schema for Cloudinary environment configuration.
 * Fails fast at bootstrap if any required var is missing/malformed,
 * instead of failing later on the first upload request.
 */
export const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('uploads'),
  CLOUDINARY_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  CLOUDINARY_MAX_RETRY_ATTEMPTS: z.coerce.number().int().min(0).max(10).default(3),
  CLOUDINARY_RETRY_BASE_DELAY_MS: z.coerce.number().int().min(50).default(300),
  CLOUDINARY_SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(30).default(300),
});

export type CloudinaryEnv = z.infer<typeof cloudinaryEnvSchema>;

export function validateCloudinaryEnv(raw: Record<string, unknown>): CloudinaryEnv {
  const result = cloudinaryEnvSchema.safeParse(raw);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid Cloudinary configuration -> ${formatted}`);
  }
  return result.data;
}
