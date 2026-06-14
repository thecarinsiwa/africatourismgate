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
import { vehicleUploadUrl } from '../../../common/utils/public-asset-url';
import { Vehicles } from '../../../entities/generated';
import { VehiclesService } from './vehicles.service';

const VEHICLE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_VEHICLE_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VEHICLE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('vehicles')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @RequirePermissions('vehicles.read')
  @Get()
  @ApiOperation({ summary: 'List vehicles' })
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
          const uploadDir = join(process.cwd(), 'uploads', 'vehicles');
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
      limits: { fileSize: VEHICLE_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_VEHICLE_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_VEHICLE_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('vehicles.write')
  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Upload vehicle image (JPEG, PNG or WebP, max 5 MB)' })
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
    return { url: vehicleUploadUrl(file.filename) };
  }

  @RequirePermissions('vehicles.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicles by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('vehicles.write')
  @Post()
  @ApiOperation({ summary: 'Create vehicles' })
  create(@Body() dto: DeepPartial<Vehicles>) {
    return this.service.create(dto);
  }

  @RequirePermissions('vehicles.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update vehicles' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Vehicles>) {
    return this.service.update(id, dto);
  }

  @RequirePermissions('vehicles.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete vehicles' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
