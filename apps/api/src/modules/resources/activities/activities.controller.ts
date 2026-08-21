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
import { DeepPartial } from 'typeorm';
import {
  activityDescriptionAssetUploadUrl,
  activityUploadUrl,
} from '../../../common/utils/public-asset-url';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { Activities } from '../../../entities/generated';
import { ActivitiesListQueryDto } from './dto/activities-list-query.dto';
import { ActivitiesService } from './activities.service';

const ACTIVITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_ACTIVITY_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_ACTIVITY_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const ACTIVITY_DESCRIPTION_ASSET_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_ACTIVITY_DESCRIPTION_ASSET_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const ALLOWED_ACTIVITY_DESCRIPTION_ASSET_EXTENSIONS = new Set([
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

@ApiTags('activities')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activities' })
  findAll(@Query() query: ActivitiesListQueryDto) {
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'activities', 'description-assets');
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
      limits: { fileSize: ACTIVITY_DESCRIPTION_ASSET_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_ACTIVITY_DESCRIPTION_ASSET_MIMES.has(file.mimetype) ||
          !ALLOWED_ACTIVITY_DESCRIPTION_ASSET_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('activities.write')
  @Post('upload-description-asset')
  @ApiOperation({
    summary: 'Upload activity description asset (image/PDF/Word, max 10 MB)',
  })
  uploadDescriptionAssetWithoutActivity(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string; assetType: 'image' | 'pdf' | 'word' } {
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (image, PDF ou Word, max 10 Mo).',
      );
    }
    const extension = extname(file.originalname || '').toLowerCase();
    return {
      url: activityDescriptionAssetUploadUrl(file.filename),
      assetType: descriptionAssetTypeFromExtension(extension),
    };
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'activities');
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
      limits: { fileSize: ACTIVITY_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_ACTIVITY_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_ACTIVITY_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('activities.write')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload activity image (JPEG, PNG or WebP, max 5 MB)' })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string }> {
    await this.service.findOne(id);
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG ou WebP, max 5 Mo).',
      );
    }
    return { url: activityUploadUrl(file.filename) };
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'activities', 'description-assets');
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
      limits: { fileSize: ACTIVITY_DESCRIPTION_ASSET_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_ACTIVITY_DESCRIPTION_ASSET_MIMES.has(file.mimetype) ||
          !ALLOWED_ACTIVITY_DESCRIPTION_ASSET_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('activities.write')
  @Post(':id/upload-description-asset')
  @ApiOperation({
    summary: 'Upload activity description asset (image/PDF/Word, max 10 MB)',
  })
  async uploadDescriptionAsset(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string; assetType: 'image' | 'pdf' | 'word' }> {
    await this.service.findOne(id);
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (image, PDF ou Word, max 10 Mo).',
      );
    }
    const extension = extname(file.originalname || '').toLowerCase();
    return {
      url: activityDescriptionAssetUploadUrl(file.filename),
      assetType: descriptionAssetTypeFromExtension(extension),
    };
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity' })
  create(@Body() dto: DeepPartial<Activities>) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Activities>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
