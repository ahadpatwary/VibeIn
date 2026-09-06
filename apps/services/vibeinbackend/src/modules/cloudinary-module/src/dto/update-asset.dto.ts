import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string; // e.g. "alt=product photo|caption=front view"

  @IsOptional()
  @IsString()
  @MaxLength(200)
  moveToFolder?: string;
}
