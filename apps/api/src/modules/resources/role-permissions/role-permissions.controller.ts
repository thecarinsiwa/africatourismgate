import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { RolePermissions } from '../../../entities/generated';
import { RolePermissionsService } from './role-permissions.service';

@ApiTags('role-permissions')
@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly service: RolePermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List role-permissions' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create role-permissions' })
  create(@Body() dto: Partial<RolePermissions>) {
    return this.service.create(dto);
  }

  @Delete(':roleId/:permissionId')
  @ApiOperation({ summary: 'Soft-delete role-permissions' })
  remove(@Param("roleId") roleId: string, @Param("permissionId") permissionId: string) {
    return this.service.remove(roleId, permissionId);
  }
}
