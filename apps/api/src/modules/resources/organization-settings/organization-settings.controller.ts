import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
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
