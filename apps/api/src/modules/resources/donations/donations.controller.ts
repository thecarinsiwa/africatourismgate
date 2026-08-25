import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { donationDescriptionAssetUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateDonationDto } from './dto/create-donation.dto';
import { DonationsListQueryDto } from './dto/donations-list-query.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { DonationsService } from './donations.service';

const DONATION_DESCRIPTION_ASSET_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_DONATION_DESCRIPTION_ASSET_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_DONATION_DESCRIPTION_ASSET_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.pdf',
  '.doc',
  '.docx',
]);

function descriptionAssetTypeFromExtension(
  extension: string,
): 'image' | 'pdf' | 'word' {
  if (extension === '.pdf') return 'pdf';
  if (extension === '.doc' || extension === '.docx') return 'word';
  return 'image';
}

function donationDescriptionAssetUploadInterceptor() {
  return FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const uploadDir = join(process.cwd(), 'uploads', 'donations', 'description-assets');
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        cb(null, `${Date.now()}-${randomUUID()}${extension}`);
      },
    }),
    limits: { fileSize: DONATION_DESCRIPTION_ASSET_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
      const extension = extname(file.originalname || '').toLowerCase();
      if (
        !ALLOWED_DONATION_DESCRIPTION_ASSET_MIMES.has(file.mimetype) ||
        !ALLOWED_DONATION_DESCRIPTION_ASSET_EXTENSIONS.has(extension)
      ) {
        cb(null, false);
        return;
      }
      cb(null, true);
    },
  });
}

function parseDescriptionAssetUpload(
  file: Express.Multer.File | undefined,
): { url: string; assetType: 'image' | 'pdf' | 'word' } {
  if (!file) {
    throw new BadRequestException(
      'Fichier requis (image, PDF ou Word, max 10 Mo).',
    );
  }
  const extension = extname(file.originalname || '').toLowerCase();
  return {
    url: donationDescriptionAssetUploadUrl(file.filename),
    assetType: descriptionAssetTypeFromExtension(extension),
  };
}

@ApiTags('donations')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('donations')
export class DonationsController {
  constructor(private readonly service: DonationsService) {}

  @RequirePermissions('organization_settings.read')
  @Get()
  @ApiOperation({ summary: 'List donation campaigns' })
  findAll(@Query() query: DonationsListQueryDto) {
    return this.service.findAll(query);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(donationDescriptionAssetUploadInterceptor())
  @RequirePermissions('organization_settings.write')
  @Post('upload-description-asset')
  @ApiOperation({
    summary: 'Upload donation description asset (image/PDF/Word, max 10 MB)',
  })
  uploadDescriptionAssetWithoutDonation(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string; assetType: 'image' | 'pdf' | 'word' } {
    return parseDescriptionAssetUpload(file);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(donationDescriptionAssetUploadInterceptor())
  @RequirePermissions('organization_settings.write')
  @Post(':id/upload-description-asset')
  @ApiOperation({
    summary: 'Upload donation description asset (image/PDF/Word, max 10 MB)',
  })
  async uploadDescriptionAsset(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string; assetType: 'image' | 'pdf' | 'word' }> {
    await this.service.findOne(id);
    return parseDescriptionAssetUpload(file);
  }

  @RequirePermissions('organization_settings.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get donation campaign by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('organization_settings.write')
  @Post()
  @ApiOperation({ summary: 'Create donation campaign' })
  create(@Body() dto: CreateDonationDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('organization_settings.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update donation campaign' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDonationDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('organization_settings.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete donation campaign' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
