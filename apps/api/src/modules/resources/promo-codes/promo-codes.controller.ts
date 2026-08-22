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
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { DeepPartial } from 'typeorm';
import { promoCodeUploadUrl } from '../../../common/utils/public-asset-url';
import { PromoCodes } from '../../../entities/generated';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';
import { PromoCodesService } from './promo-codes.service';

const PROMO_CODE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROMO_CODE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_PROMO_CODE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly service: PromoCodesService) {}

  @Get()
  @ApiOperation({ summary: 'List promo-codes' })
  findAll(@Query() query: PromoCodesListQueryDto) {
    return this.service.list(query);
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
          const uploadDir = join(process.cwd(), 'uploads', 'promo-codes');
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
      limits: { fileSize: PROMO_CODE_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_PROMO_CODE_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_PROMO_CODE_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload promo code cover image (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: promoCodeUploadUrl(file.filename) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promo-codes by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create promo-codes' })
  create(@Body() dto: DeepPartial<PromoCodes>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promo-codes' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<PromoCodes>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete promo-codes' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
