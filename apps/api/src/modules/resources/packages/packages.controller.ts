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
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { DeepPartial } from 'typeorm';
import { packageUploadUrl } from '../../../common/utils/public-asset-url';
import { Packages } from '../../../entities/generated';
import { PackagesListQueryDto } from './dto/packages-list-query.dto';
import { PackageImageSuggestionsService } from './package-image-suggestions.service';
import { PackagesService } from './packages.service';

const PACKAGE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PACKAGE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_PACKAGE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('packages')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('packages')
export class PackagesController {
  constructor(
    private readonly service: PackagesService,
    private readonly suggestionsService: PackageImageSuggestionsService,
  ) {}

  @RequirePermissions('packages.read')
  @Get()
  @ApiOperation({ summary: 'List packages' })
  findAll(@Query() query: PackagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('packages.read')
  @Get(':id/suggested-images')
  @ApiOperation({ summary: 'List suggested images from package product items' })
  listSuggestedImages(@Param('id') id: string) {
    return this.suggestionsService.listSuggestedImages(id);
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
          const uploadDir = join(process.cwd(), 'uploads', 'packages');
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
      limits: { fileSize: PACKAGE_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_PACKAGE_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_PACKAGE_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('packages.write')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload package image (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: packageUploadUrl(file.filename) };
  }

  @RequirePermissions('packages.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get packages by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDetail(id);
  }

  @RequirePermissions('packages.write')
  @Post()
  @ApiOperation({ summary: 'Create packages' })
  create(@Body() dto: DeepPartial<Packages>) {
    return this.service.create(dto);
  }

  @RequirePermissions('packages.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update packages' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Packages>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('packages.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete packages' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
