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
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { activityProviderUploadUrl } from '../../../common/utils/public-asset-url';
import { ActivityProviders } from '../../../entities/generated';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { ActivityProvidersService } from './activity-providers.service';

const PROVIDER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROVIDER_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_PROVIDER_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('activity-providers')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('activity-providers')
export class ActivityProvidersController {
  constructor(private readonly service: ActivityProvidersService) {}

  @RequirePermissions('activities.read')
  @Get()
  @ApiOperation({ summary: 'List activity-providers' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('activities.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get activity-providers by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('activities.write')
  @Post()
  @ApiOperation({ summary: 'Create activity-providers' })
  create(@Body() dto: DeepPartial<ActivityProviders>) {
    return this.service.create(dto);
  }

  @RequirePermissions('activities.write')
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
          const uploadDir = join(process.cwd(), 'uploads', 'activity-providers');
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
      limits: { fileSize: PROVIDER_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_PROVIDER_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_PROVIDER_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload activity-provider logo (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: activityProviderUploadUrl(file.filename) };
  }

  @RequirePermissions('activities.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-providers' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityProviders>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('activities.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-providers' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
