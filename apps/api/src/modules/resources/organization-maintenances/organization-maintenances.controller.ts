import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateOrganizationMaintenanceDto } from './dto/create-organization-maintenance.dto';
import { OrganizationMaintenanceDto } from './dto/organization-maintenance.dto';
import { OrganizationMaintenancesListQueryDto } from './dto/organization-maintenances-list-query.dto';
import { UpdateOrganizationMaintenanceDto } from './dto/update-organization-maintenance.dto';
import { OrganizationMaintenancesService } from './organization-maintenances.service';

@ApiTags('organization-maintenances')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('organization-maintenances')
export class OrganizationMaintenancesController {
  constructor(private readonly service: OrganizationMaintenancesService) {}

  @Get()
  @RequirePermissions('organization_settings.read')
  @ApiOperation({ summary: 'List organization maintenances (scoped)' })
  @ApiOkResponse({ type: [OrganizationMaintenanceDto] })
  findAll(
    @Query() query: OrganizationMaintenancesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.list(query, user);
  }

  @Get(':id')
  @RequirePermissions('organization_settings.read')
  @ApiOperation({ summary: 'Get organization maintenance by id (scoped)' })
  findOne(
    @Param('id') id: string,
    @Query() query: OrganizationMaintenancesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.findOneDto(id, user, query.organizationId);
  }

  @Post()
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Create organization maintenance (scoped)' })
  create(
    @Body() dto: CreateOrganizationMaintenanceDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Update organization maintenance (scoped)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationMaintenanceDto,
    @Query() query: OrganizationMaintenancesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user, query.organizationId);
  }

  @Delete(':id')
  @RequirePermissions('organization_settings.write')
  @ApiOperation({ summary: 'Soft-delete organization maintenance (scoped)' })
  remove(
    @Param('id') id: string,
    @Query() query: OrganizationMaintenancesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.removeScoped(id, user, query.organizationId);
  }
}
