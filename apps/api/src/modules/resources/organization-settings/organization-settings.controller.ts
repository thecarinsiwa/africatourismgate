import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { brandingUploadUrl } from '../../../common/utils/public-asset-url';
import type { Request } from 'express';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import { OrganizationSettingDto } from './dto/organization-setting.dto';
import { OrganizationSettingsListQueryDto } from './dto/organization-settings-list-query.dto';
import { OrganizationSettingsService } from './organization-settings.service';

@ApiTags('organization-settings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organization-settings')
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  @Public()
  @Get('public/branding')
  @ApiOperation({
    summary: 'Get public branding for the active/default organization',
  })
  findPublicBranding(@Query('organizationSlug') organizationSlug?: string) {
    return this.service.findPublicBranding(organizationSlug);
  }

  @Get()
  @RequirePermissions('organization_settings.read')
  @ApiOperation({ summary: 'List organization settings (scoped)' })
  findAll(
    @CurrentUser() user: AuthUserDto,
    @Query() query: OrganizationSettingsListQueryDto,
  ) {
    return this.service.findAll(user, query);
  }

  @Put('bulk')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Bulk upsert organization settings (scoped)' })
  bulkUpsert(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: BulkUpsertOrganizationSettingsDto,
  ): Promise<OrganizationSettingDto[]> {
    return this.service.bulkUpsert(user, dto);
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
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          const uploadDir = join(process.cwd(), 'uploads', 'branding');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype?.startsWith('image/')) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @Put('upload-branding')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Upload branding asset (logo/favicon)' })
  uploadBrandingAsset(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (PNG, JPG, SVG ou WebP, max 2 Mo).',
      );
    }
    return { url: brandingUploadUrl(file.filename) };
  }

  @Get(':id')
  @RequirePermissions('organization_settings.read')
  @ApiOperation({ summary: 'Get organization setting by id (scoped)' })
  findOne(
    @CurrentUser() user: AuthUserDto,
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<OrganizationSettingDto> {
    return this.service.findOne(user, id, organizationId);
  }
}
