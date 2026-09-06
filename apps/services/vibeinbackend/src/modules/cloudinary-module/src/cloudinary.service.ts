import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as CloudinaryClient, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY_CLIENT, CLOUDINARY_MODULE_OPTIONS } from './constants/cloudinary.constants';
import { CloudinaryModuleOptions } from './interfaces/cloudinary-module-options.interface';
import {
  CloudinaryAssetResult,
  PresignedUploadParams,
  SignedDeliveryUrlResult,
} from './interfaces/cloudinary-upload-result.interface';
import { MediaKind, mediaKindToCloudinaryResourceType } from './enums/resource-type.enum';
import { withRetry } from './utils/retry.util';
import { mapCloudinaryError } from './utils/map-cloudinary-error.util';
import { CloudinarySignatureException } from './exceptions/cloudinary.exception';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    @Inject(CLOUDINARY_CLIENT) private readonly client: typeof CloudinaryClient,
    @Inject(CLOUDINARY_MODULE_OPTIONS) private readonly options: CloudinaryModuleOptions,
  ) {}

  /**
   * Server-side upload: buffer flows through your NestJS app.
   * Use this for smaller files or when you need to do something
   * (virus scan, ownership check) before the asset lands on Cloudinary.
   */
  async uploadFile(
    buffer: Buffer,
    kind: MediaKind,
    opts: { folder?: string; publicId?: string; tags?: string[] } = {},
  ): Promise<CloudinaryAssetResult> {
    const resourceType = mediaKindToCloudinaryResourceType(kind);
    const folder = opts.folder ?? this.options.uploadFolder;

    try {
      const result = await withRetry(
        () =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = this.client.uploader.upload_stream(
              {
                resource_type: resourceType,
                folder,
                public_id: opts.publicId,
                tags: opts.tags,
                overwrite: false,
                unique_filename: true,
              },
              (err, result) => {
                if (err || !result) return reject(err ?? new Error('Empty upload response'));
                resolve(result);
              },
            );
            stream.end(buffer);
          }),
        {
          maxAttempts: this.options.maxRetryAttempts,
          baseDelayMs: this.options.retryBaseDelayMs,
          operationName: `uploadFile(${kind})`,
        },
      );

      return this.toAssetResult(result, kind);
    } catch (err) {
      this.logger.error(`Upload failed for kind=${kind} folder=${folder}`, err as Error);
      throw mapCloudinaryError(err, 'upload');
    }
  }

  /**
   * Generates signed params for the CLIENT to upload directly to Cloudinary
   * (bypasses your server entirely for the file bytes — the "presigned URL"
   * flow). The signature is computed server-side from the exact params so
   * the client cannot tamper with folder/public_id/tags after the fact.
   */
  generatePresignedUpload(
    kind: MediaKind,
    opts: { folder?: string; publicId?: string } = {},
  ): PresignedUploadParams {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = opts.folder ?? this.options.uploadFolder;
    const resourceType = mediaKindToCloudinaryResourceType(kind);

    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
      ...(opts.publicId ? { public_id: opts.publicId } : {}),
    };

    try {
      const signature = this.client.utils.api_sign_request(
        paramsToSign,
        this.options.apiSecret,
      );

      return {
        timestamp,
        signature,
        apiKey: this.options.apiKey,
        cloudName: this.options.cloudName,
        folder,
        publicId: opts.publicId,
        uploadUrl: `https://api.cloudinary.com/v1_1/${this.options.cloudName}/${resourceType}/upload`,
        extraParams: paramsToSign,
      };
    } catch (err) {
      this.logger.error('Failed to generate presigned upload params', err as Error);
      throw new CloudinarySignatureException(
        'Could not generate a signed upload signature.',
        { cause: err },
      );
    }
  }

  /** Signed, time-limited delivery URL — for private/authenticated assets. */
  generateSignedDeliveryUrl(
    publicId: string,
    kind: MediaKind,
    ttlSeconds: number = this.options.signedUrlTtlSeconds,
  ): SignedDeliveryUrlResult {
    const resourceType = mediaKindToCloudinaryResourceType(kind);
    const expiresAtEpoch = Math.floor(Date.now() / 1000) + ttlSeconds;

    try {
      const url = this.client.url(publicId, {
        resource_type: resourceType,
        type: 'authenticated',
        sign_url: true,
        secure: this.options.secure,
        auth_token: { duration: ttlSeconds },
      });

      return { url, expiresAt: new Date(expiresAtEpoch * 1000).toISOString() };
    } catch (err) {
      this.logger.error(`Failed to sign delivery URL for ${publicId}`, err as Error);
      throw new CloudinarySignatureException('Could not generate a signed delivery URL.', {
        publicId,
        cause: err,
      });
    }
  }

  async updateAsset(
    publicId: string,
    kind: MediaKind,
    changes: { tags?: string[]; context?: string; moveToFolder?: string },
  ): Promise<CloudinaryAssetResult> {
    const resourceType = mediaKindToCloudinaryResourceType(kind);

    try {
      const result = await withRetry(
        async () => {
          if (changes.moveToFolder) {
            await this.client.uploader.rename(publicId, `${changes.moveToFolder}/${this.basename(publicId)}`, {
              resource_type: resourceType,
            });
          }
          return this.client.uploader.explicit(publicId, {
            resource_type: resourceType,
            type: 'upload',
            tags: changes.tags,
            context: changes.context,
          });
        },
        {
          maxAttempts: this.options.maxRetryAttempts,
          baseDelayMs: this.options.retryBaseDelayMs,
          operationName: `updateAsset(${publicId})`,
        },
      );

      return this.toAssetResult(result, kind);
    } catch (err) {
      this.logger.error(`Update failed for ${publicId}`, err as Error);
      throw mapCloudinaryError(err, 'update', publicId);
    }
  }

  async deleteAsset(publicId: string, kind: MediaKind): Promise<{ publicId: string; deleted: true }> {
    const resourceType = mediaKindToCloudinaryResourceType(kind);

    try {
      const result = await withRetry(
        () =>
          this.client.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true,
          }),
        {
          maxAttempts: this.options.maxRetryAttempts,
          baseDelayMs: this.options.retryBaseDelayMs,
          operationName: `deleteAsset(${publicId})`,
        },
      );

      if (result?.result !== 'ok' && result?.result !== 'not found') {
        throw result;
      }

      return { publicId, deleted: true };
    } catch (err) {
      this.logger.error(`Delete failed for ${publicId}`, err as Error);
      throw mapCloudinaryError(err, 'delete', publicId);
    }
  }

  private basename(publicId: string): string {
    const parts = publicId.split('/');
    return parts[parts.length - 1];
  }

  private toAssetResult(result: UploadApiResponse, kind: MediaKind): CloudinaryAssetResult {
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      kind,
      format: result.format ?? null,
      bytes: result.bytes,
      width: result.width ?? null,
      height: result.height ?? null,
      durationSeconds: (result as any).duration ?? null,
      createdAt: result.created_at,
      version: result.version,
    };
  }
}
