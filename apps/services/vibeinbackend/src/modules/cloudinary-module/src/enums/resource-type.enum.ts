export enum CloudinaryResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'video', // Cloudinary treats audio as a "video" resource_type internally
  RAW = 'raw',
}

/**
 * The public-facing kind the client/API cares about. Kept separate from
 * CloudinaryResourceType because Cloudinary has no native "audio" resource
 * type — audio files are uploaded as resource_type=video under the hood.
 */
export enum MediaKind {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export function mediaKindToCloudinaryResourceType(
  kind: MediaKind,
): 'image' | 'video' | 'raw' {
  switch (kind) {
    case MediaKind.IMAGE:
      return 'image';
    case MediaKind.VIDEO:
    case MediaKind.AUDIO:
      return 'video';
    default:
      return 'raw';
  }
}
