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
import { DeepPartial } from 'typeorm';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { UserRoleAssignments } from '../../../entities/generated';
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto';
import { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@ApiTags('user-role-assignments')
@Controller('user-role-assignments')
export class UserRoleAssignmentsController {
  constructor(private readonly service: UserRoleAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-role-assignments' })
  findAll(@Query() query: UserRoleAssignmentsListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-role-assignments by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-role-assignments' })
  create(
    @Body() dto: CreateUserRoleAssignmentDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke a user role assignment' })
  revoke(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.revoke(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-role-assignments' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<UserRoleAssignments>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-role-assignments' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
