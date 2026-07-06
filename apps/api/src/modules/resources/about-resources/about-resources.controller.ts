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
import { aboutResourceUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AboutResourcesService } from './about-resources.service';
import { AboutResourcesListQueryDto } from './dto/about-resources-list-query.dto';
import { CreateAboutResourceDto } from './dto/create-about-resource.dto';
import { UpdateAboutResourceDto } from './dto/update-about-resource.dto';

const FILE_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const ALLOWED_FILE_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('about-resources')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('about-resources')
export class AboutResourcesController {
  constructor(private readonly service: AboutResourcesService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List about resources' })
  findAll(@Query() query: AboutResourcesListQueryDto) {
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
          const uploadDir = join(process.cwd(), 'uploads', 'about', 'resources');
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
      limits: { fileSize: FILE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_FILE_MIMES.has(file.mimetype) ||
          !ALLOWED_FILE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('content.write')
  @Post('upload-file')
  @ApiOperation({
    summary: 'Upload about resource file (PDF or image, max 10 MB)',
  })
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier requis (PDF, JPEG, PNG ou WebP, max 10 Mo).',
      );
    }
    return { url: aboutResourceUploadUrl(file.filename) };
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get about resource by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create about resource' })
  create(@Body() dto: CreateAboutResourceDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update about resource' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAboutResourceDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete about resource' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
