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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import { RolesListQueryDto } from './dto/roles-list-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  findAll(@Query() query: RolesListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions granted to a role' })
  getPermissions(@Param('id') id: string) {
    return this.service.getPermissions(id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace permissions granted to a role' })
  replacePermissions(
    @Param('id') id: string,
    @Body() dto: ReplaceRolePermissionsDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.replacePermissions(id, dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get roles by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create roles' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update roles' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete roles' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.removeRole(id, user.id);
  }
}
