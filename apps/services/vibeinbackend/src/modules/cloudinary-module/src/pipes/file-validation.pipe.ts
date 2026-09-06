import { Injectable, PipeTransform } from '@nestjs/common';
import { CLOUDINARY_FILE_LIMITS } from '../constants/cloudinary.constants';
import { CloudinaryValidationException } from '../exceptions/cloudinary.exception';
import { MediaKind } from '../enums/resource-type.enum';

/**
 * Nest's built-in ParseFilePipe covers generic cases, but we need the
 * allow-list/size-cap to depend on `kind` from the route body, so this
 * is applied manually in the controller after both are available.
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  validate(file: Express.Multer.File | undefined, kind: MediaKind): Express.Multer.File {
    if (!file) {
      throw new CloudinaryValidationException('No file was provided in the request.');
    }

    const limits = CLOUDINARY_FILE_LIMITS[kind];
    if (!limits) {
      throw new CloudinaryValidationException(`Unsupported media kind: ${kind}`);
    }

    if (!limits.allowedMimeTypes.includes(file.mimetype)) {
      throw new CloudinaryValidationException(
        `Unsupported mime type "${file.mimetype}" for kind "${kind}". Allowed: ${limits.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > limits.maxSizeBytes) {
      const maxMb = (limits.maxSizeBytes / (1024 * 1024)).toFixed(0);
      throw new CloudinaryValidationException(
        `File too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max allowed for ${kind} is ${maxMb}MB.`,
      );
    }

    return file;
  }

  // Satisfies PipeTransform if ever wired into @UsePipes(); prefer calling
  // .validate() directly in the controller since `kind` comes from the body.
  transform(value: Express.Multer.File) {
    return value;
  }
}
