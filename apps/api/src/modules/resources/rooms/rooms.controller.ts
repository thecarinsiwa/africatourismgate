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
import { roomUploadUrl } from '../../../common/utils/public-asset-url';
import { Rooms } from '../../../entities/generated';
import { RoomsListQueryDto } from './dto/rooms-list-query.dto';
import { RoomsService } from './rooms.service';

const ROOM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_ROOM_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_ROOM_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms' })
  findAll(@Query() query: RoomsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rooms by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create rooms' })
  create(@Body() dto: DeepPartial<Rooms>) {
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
          const uploadDir = join(process.cwd(), 'uploads', 'rooms');
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
      limits: { fileSize: ROOM_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_ROOM_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_ROOM_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload room image (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: roomUploadUrl(file.filename) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rooms' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Rooms>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rooms' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
