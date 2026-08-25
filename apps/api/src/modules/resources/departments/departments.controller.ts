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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsListQueryDto } from './dto/departments-list-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentsService } from './departments.service';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  @RequirePermissions('departments.read')
  @ApiOperation({ summary: 'List departments' })
  findAll(
    @Query() query: DepartmentsListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.list(query, user);
  }

  @Get(':id')
  @RequirePermissions('departments.read')
  @ApiOperation({ summary: 'Get department by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.findOneForUser(id, user);
  }

  @Post()
  @RequirePermissions('departments.write')
  @ApiOperation({ summary: 'Create department' })
  create(@Body() dto: CreateDepartmentDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user);
  }

  @Patch(':id')
  @RequirePermissions('departments.write')
  @ApiOperation({ summary: 'Update department' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user);
  }

  @Delete(':id')
  @RequirePermissions('departments.write')
  @ApiOperation({ summary: 'Soft-delete department' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.removeForUser(id, user);
  }
}
