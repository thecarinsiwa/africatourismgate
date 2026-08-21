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
import { airlineUploadUrl } from '../../../common/utils/public-asset-url';
import { Airlines } from '../../../entities/generated';
import { AirlinesService } from './airlines.service';
import { AirlinesListQueryDto } from './dto/airlines-list-query.dto';

const AIRLINE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_AIRLINE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_AIRLINE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('airlines')
@Controller('airlines')
export class AirlinesController {
  constructor(private readonly service: AirlinesService) {}

  @Get()
  @ApiOperation({ summary: 'List airlines' })
  findAll(@Query() query: AirlinesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airlines by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airlines' })
  create(@Body() dto: DeepPartial<Airlines>) {
    return this.service.create(dto);
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
          const uploadDir = join(process.cwd(), 'uploads', 'airlines');
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
      limits: { fileSize: AIRLINE_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_AIRLINE_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_AIRLINE_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload airline logo (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: airlineUploadUrl(file.filename) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update airlines' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Airlines>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airlines' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
