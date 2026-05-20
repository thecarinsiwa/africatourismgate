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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolesListQueryDto } from './dto/roles-list-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List roles' })
  findAll(@Query() query: RolesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id/permissions')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get permission ids for role' })
  getRolePermissions(@Param('id') id: string) {
    return this.service.getRolePermissions(id);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get role by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Create custom role' })
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Update custom role' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Soft-delete custom role' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Put(':id/permissions')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Replace role permissions (matrix)' })
  replaceRolePermissions(
    @Param('id') id: string,
    @Body() dto: ReplaceRolePermissionsDto,
  ) {
    return this.service.replaceRolePermissions(id, dto);
  }
}
