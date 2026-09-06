import { MediaKind } from '../enums/resource-type.enum';

export interface CloudinaryAssetResult {
  publicId: string;
  url: string;
  secureUrl: string;
  kind: MediaKind;
  format: string | null;
  bytes: number;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  createdAt: string;
  version: number;
}

export interface PresignedUploadParams {
  /** Params the client signs against and sends directly to Cloudinary. */
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId?: string;
  uploadUrl: string;
  /** Any extra params that were included in the signature — client must echo them verbatim. */
  extraParams: Record<string, string | number>;
}

export interface SignedDeliveryUrlResult {
  url: string;
  expiresAt: string;
}
