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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Roles } from '../../../entities/generated';
import {
  ReplaceRolePermissionsDto,
  RolePermissionsPayloadDto,
} from './dto/replace-role-permissions.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions granted to a role' })
  getPermissions(@Param('id') id: string): Promise<RolePermissionsPayloadDto> {
    return this.service.getPermissions(id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace permissions granted to a role' })
  replacePermissions(
    @Param('id') id: string,
    @Body() dto: ReplaceRolePermissionsDto,
  ): Promise<RolePermissionsPayloadDto> {
    return this.service.replacePermissions(id, dto.permissionIds);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get roles by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create roles' })
  create(@Body() dto: DeepPartial<Roles>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update roles' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<Roles>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete roles' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
