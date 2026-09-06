import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { DeleteAssetDto } from './dto/delete-asset.dto';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './enums/role.enum';
import { MediaKind } from './enums/resource-type.enum';

// Swap in your project's real JwtAuthGuard here.
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cloudinary')
// @UseGuards(JwtAuthGuard, RolesGuard)
@UseGuards(RolesGuard)
export class CloudinaryController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly fileValidationPipe: FileValidationPipe,
  ) {}

  /**
   * Server-mediated upload. Body must be multipart/form-data with:
   *  - file: the binary
   *  - kind: 'image' | 'video' | 'audio'
   *  - folder?, publicId? (optional)
   */
  @Post('upload')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.STAFF)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    // @UploadedFile() file: Express.Multer.File,
    @UploadedFile() file: File,
    @Body('kind') kind: MediaKind,
    @Body('folder') folder?: string,
    @Body('publicId') publicId?: string,
  ) {
    const validated = this.fileValidationPipe.validate(file, kind);
    return this.cloudinaryService.uploadFile(validated.buffer, kind, { folder, publicId });
  }

  /**
   * Direct-to-Cloudinary flow: client requests a signature here, then
   * uploads the file bytes straight to Cloudinary's API with it —
   * your server never touches the file body.
   */
  @Post('presigned-url')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.STAFF)
  generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.cloudinaryService.generatePresignedUpload(dto.kind, {
      folder: dto.folder,
      publicId: dto.publicId,
    });
  }

  /** Signed, time-limited URL for delivering a private/authenticated asset. */
  @Post(':publicId/signed-delivery-url')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.STAFF)
  generateSignedDeliveryUrl(
    @Param('publicId') publicId: string,
    @Query('kind') kind: MediaKind,
    @Query('ttlSeconds') ttlSeconds?: string,
  ) {
    return this.cloudinaryService.generateSignedDeliveryUrl(
      publicId,
      kind,
      ttlSeconds ? Number(ttlSeconds) : undefined,
    );
  }

  @Patch(':publicId')
  @Roles(Role.ADMIN, Role.MERCHANT)
  updateAsset(
    @Param('publicId') publicId: string,
    @Query('kind') kind: MediaKind,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.cloudinaryService.updateAsset(publicId, kind, {
      tags: dto.tags,
      context: dto.context,
      moveToFolder: dto.moveToFolder,
    });
  }

  @Delete(':publicId')
  @Roles(Role.ADMIN, Role.MERCHANT)
  deleteAsset(@Param('publicId') publicId: string, @Body() dto: DeleteAssetDto) {
    return this.cloudinaryService.deleteAsset(publicId, dto.kind);
  }
}
