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
import { happyCustomersSectionUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateHappyCustomersSectionDto } from './dto/create-happy-customers-section.dto';
import { HappyCustomersSectionsListQueryDto } from './dto/happy-customers-sections-list-query.dto';
import { UpdateHappyCustomersSectionDto } from './dto/update-happy-customers-section.dto';
import { HappyCustomersSectionsService } from './happy-customers-sections.service';

const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('happy-customers-sections')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('happy-customers-sections')
export class HappyCustomersSectionsController {
  constructor(private readonly service: HappyCustomersSectionsService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List happy-customers sections' })
  findAll(@Query() query: HappyCustomersSectionsListQueryDto) {
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
          const uploadDir = join(process.cwd(), 'uploads', 'happy-customers', 'sections');
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
      limits: { fileSize: IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('content.write')
  @Post('upload-image')
  @ApiOperation({ summary: 'Upload happy-customers section image (JPEG, PNG or WebP, max 5 MB)' })
  uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG ou WebP, max 5 Mo).',
      );
    }
    return { url: happyCustomersSectionUploadUrl(file.filename) };
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get happy-customers section by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create happy-customers section' })
  create(@Body() dto: CreateHappyCustomersSectionDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update happy-customers section' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHappyCustomersSectionDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete happy-customers section' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
