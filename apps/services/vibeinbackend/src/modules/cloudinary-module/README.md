# NestJS Cloudinary Module

Production-grade, class-based Cloudinary integration: uploads (image/video/audio),
presigned/signed uploads, signed delivery URLs, update, delete — with role guards,
DTO validation, a domain exception hierarchy, and retry with exponential backoff.

## Install peer dependencies

```bash
npm install cloudinary zod class-validator class-transformer @nestjs/config
```

`multer`/`@nestjs/platform-express` typically already ship with a standard Nest HTTP app.

## Environment variables

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=uploads
CLOUDINARY_SECURE=true
CLOUDINARY_MAX_RETRY_ATTEMPTS=3
CLOUDINARY_RETRY_BASE_DELAY_MS=300
CLOUDINARY_SIGNED_URL_TTL_SECONDS=300
```

## Wire it up (AppModule)

```ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryModule, validateCloudinaryEnv } from './cloudinary-module/src';

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const env = validateCloudinaryEnv(process.env); // Zod: fail fast on bad config
        return {
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          apiKey: env.CLOUDINARY_API_KEY,
          apiSecret: env.CLOUDINARY_API_SECRET,
          secure: env.CLOUDINARY_SECURE,
          uploadFolder: env.CLOUDINARY_UPLOAD_FOLDER,
          maxRetryAttempts: env.CLOUDINARY_MAX_RETRY_ATTEMPTS,
          retryBaseDelayMs: env.CLOUDINARY_RETRY_BASE_DELAY_MS,
          signedUrlTtlSeconds: env.CLOUDINARY_SIGNED_URL_TTL_SECONDS,
        };
      },
    }),
  ],
})
export class AppModule {}
```

## Before using in your real app

1. **Auth guard**: `CloudinaryController` has `RolesGuard` wired, but `RolesGuard`
   only checks role membership — it does not authenticate. Uncomment and import
   your existing `JwtAuthGuard` in `cloudinary.controller.ts`:
   ```ts
   @UseGuards(JwtAuthGuard, RolesGuard)
   ```
2. **Role enum**: `enums/role.enum.ts` is a placeholder. Delete it and point
   `roles.decorator.ts` / `roles.guard.ts` / the controller at your app's real
   `Role` enum so `request.user.role` lines up.
3. **DTO validation**: enable Nest's global `ValidationPipe` (whitelist + transform)
   in `main.ts` if you haven't already — the DTOs here rely on it:
   ```ts
   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
   ```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/cloudinary/upload` | Server-mediated upload (multipart: `file`, `kind`, `folder?`, `publicId?`) |
| POST | `/cloudinary/presigned-url` | Get a signature for the client to upload directly to Cloudinary |
| POST | `/cloudinary/:publicId/signed-delivery-url` | Signed, time-limited URL for a private asset |
| PATCH | `/cloudinary/:publicId` | Update tags/context, optionally move folder |
| DELETE | `/cloudinary/:publicId` | Delete an asset |

## Design notes

- **"Presigned URL" for Cloudinary** = server signs the upload params
  (`timestamp`, `folder`, `public_id`, ...) with your API secret; the client
  then POSTs the file bytes straight to `https://api.cloudinary.com/v1_1/<cloud>/<resource_type>/upload`
  with those exact params + signature. Your server never sees the file body.
  This is `generatePresignedUpload()` in the service.
- **Audio** has no native Cloudinary resource type — it uploads as
  `resource_type: "video"` under the hood (Cloudinary's own convention).
  `MediaKind.AUDIO` maps to that transparently.
- **Retry**: `withRetry()` uses exponential backoff with full jitter, and
  only retries transient failures (429/5xx/network resets) — validation
  and 404 errors fail immediately since retrying them can't help.
- **Errors**: every SDK call is funneled through `mapCloudinaryError()`,
  which produces one of the typed `Cloudinary*Exception` subclasses so a
  global exception filter (or callers) can branch on error type instead of
  parsing Cloudinary's raw error shape everywhere.
- **File limits** (`constants/cloudinary.constants.ts`) are per-kind
  mime-type allow-lists + size caps — tune them for your merchants' actual
  upload patterns (Orderbari product photos vs. review videos, etc.).
