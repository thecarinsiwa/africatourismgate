import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { DeepPartial } from 'typeorm';
import { brandingUploadUrl } from '../../../common/utils/public-asset-url';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { OrganizationSettings } from '../../../entities/generated';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import { OrganizationSettingDto } from './dto/organization-setting.dto';
import { OrganizationSettingsListQueryDto } from './dto/organization-settings-list-query.dto';
import { PublicBrandingDto } from './dto/public-branding.dto';
import { PublicBrandingQueryDto } from './dto/public-branding-query.dto';
import { PublicContactDto } from './dto/public-contact.dto';
import { OrganizationSettingsService } from './organization-settings.service';

const BRANDING_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_BRANDING_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);
const ALLOWED_BRANDING_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
]);

@ApiTags('organization-settings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organization-settings')
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  @Public()
  @Get('public/branding')
  @ApiOperation({ summary: 'Get public branding for the active/default organization' })
  findPublicBranding(@Query() query: PublicBrandingQueryDto): Promise<PublicBrandingDto> {
    return this.service.findPublicBranding(query.organizationSlug);
  }

  @Public()
  @Get('public/contact')
  @ApiOperation({ summary: 'Get public contact details for the active/default organization' })
  findPublicContact(@Query() query: PublicBrandingQueryDto): Promise<PublicContactDto> {
    return this.service.findPublicContact(query.organizationSlug);
  }

  @Put('bulk')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Bulk upsert organization settings (scoped)' })
  @ApiOkResponse({ type: [OrganizationSettingDto] })
  bulkUpsert(
    @Body() dto: BulkUpsertOrganizationSettingsDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<OrganizationSettingDto[]> {
    return this.service.bulkUpsert(dto, user);
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
          const uploadDir = join(process.cwd(), 'uploads', 'branding');
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
      limits: { fileSize: BRANDING_IMAGE_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_BRANDING_IMAGE_MIMES.has(file.mimetype) ||
          !ALLOWED_BRANDING_IMAGE_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Put('upload-branding')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({
    summary: 'Upload branding image (logo, favicon, auth visual — max 2 MB)',
  })
  uploadBranding(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG, WebP, GIF ou SVG, max 2 Mo).',
      );
    }
    return { url: brandingUploadUrl(file.filename) };
  }

  @Get()
  @RequirePermissions('organization_settings.read')
  @ApiOperation({ summary: 'List organization settings (scoped)' })
  findAll(
    @Query() query: OrganizationSettingsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findAllScoped(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization-settings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization-settings' })
  create(@Body() dto: DeepPartial<OrganizationSettings>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization-settings' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<OrganizationSettings>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete organization-settings' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
