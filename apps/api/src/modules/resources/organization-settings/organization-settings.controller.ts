import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Public } from '../../auth/decorators/public.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { OrganizationSettings } from '../../../entities/generated';
import { BulkUpsertOrganizationSettingsDto } from './dto/bulk-upsert-organization-settings.dto';
import { OrganizationSettingDto } from './dto/organization-setting.dto';
import { PublicBrandingDto } from './dto/public-branding.dto';
import { PublicBrandingQueryDto } from './dto/public-branding-query.dto';
import { OrganizationSettingsService } from './organization-settings.service';

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

  @Get()
  @ApiOperation({ summary: 'List organization-settings' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
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
