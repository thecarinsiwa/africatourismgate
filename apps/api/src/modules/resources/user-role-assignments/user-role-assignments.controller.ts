import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto';
import { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@ApiTags('user-role-assignments')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('user-role-assignments')
export class UserRoleAssignmentsController {
  constructor(private readonly service: UserRoleAssignmentsService) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'List user role assignments' })
  findAll(@Query() query: UserRoleAssignmentsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Get assignment by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Assign role to user' })
  create(@Body() dto: CreateUserRoleAssignmentDto) {
    return this.service.create(dto);
  }

  @Patch(':id/revoke')
  @RequirePermissions('roles.write')
  @ApiOperation({ summary: 'Revoke role assignment' })
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }
}
