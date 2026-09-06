import { IsEnum } from 'class-validator';
import { MediaKind } from '../enums/resource-type.enum';

export class DeleteAssetDto {
  @IsEnum(MediaKind, { message: 'kind must be one of: image, video, audio' })
  kind: MediaKind;
}
