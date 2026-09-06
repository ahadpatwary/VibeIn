import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { MediaKind } from '../enums/resource-type.enum';

export class GeneratePresignedUrlDto {
  @IsEnum(MediaKind, { message: 'kind must be one of: image, video, audio' })
  kind: MediaKind;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9/_-]+$/, {
    message: 'folder may only contain letters, numbers, /, _ and -',
  })
  folder?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Matches(/^[a-zA-Z0-9/_-]+$/, {
    message: 'publicId may only contain letters, numbers, /, _ and -',
  })
  publicId?: string;
}
