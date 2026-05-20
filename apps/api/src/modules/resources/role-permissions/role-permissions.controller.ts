import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { RolePermissions } from '../../../entities/generated';
import { RolePermissionsService } from './role-permissions.service';

@ApiTags('role-permissions')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List role-permissions' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Create role-permissions' })
  create(@Body() dto: Partial<RolePermissions>) {
    return this.service.create(dto);
  }

  @Delete(':roleId/:permissionId')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Soft-delete role-permissions' })
  remove(@Param('roleId') roleId: string, @Param('permissionId') permissionId: string) {
    return this.service.remove(roleId, permissionId);
  }
}
