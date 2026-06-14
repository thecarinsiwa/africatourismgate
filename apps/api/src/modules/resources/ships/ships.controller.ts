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
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { shipUploadUrl } from '../../../common/utils/public-asset-url';
import { Ships } from '../../../entities/generated';
import { ShipsService } from './ships.service';

const SHIP_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_SHIP_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_SHIP_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('ships')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('ships')
export class ShipsController {
  constructor(private readonly service: ShipsService) {}

  @RequirePermissions('cruises.read')
  @Get()
  @ApiOperation({ summary: 'List ships' })
  findAll(@Query() query: PaginationQueryDto) {
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
          const uploadDir = join(process.cwd(), 'uploads', 'ships');
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
      limits: { fileSize: SHIP_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_SHIP_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_SHIP_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('cruises.write')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload ship image (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: shipUploadUrl(file.filename) };
  }

  @RequirePermissions('cruises.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get ships by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('cruises.write')
  @Post()
  @ApiOperation({ summary: 'Create ships' })
  create(@Body() dto: DeepPartial<Ships>) {
    return this.service.create(dto);
  }

  @RequirePermissions('cruises.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update ships' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Ships>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('cruises.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ships' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
