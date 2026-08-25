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
import { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

class CreateUserRoleAssignmentBodyDto {
  userId!: string;
  roleId!: string;
  scopeType!: 'global' | 'property' | 'agency' | 'support_queue';
  scopeId?: string | null;
  expiresAt?: string | null;
}

@ApiTags('user-role-assignments')
@Controller('user-role-assignments')
export class UserRoleAssignmentsController {
  constructor(private readonly service: UserRoleAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-role-assignments' })
  findAll(@Query() query: UserRoleAssignmentsListQueryDto) {
    return this.service.findAllEnriched(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-role-assignments by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneEnriched(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-role-assignments' })
  create(@Body() dto: CreateUserRoleAssignmentBodyDto) {
    return this.service.createAssignment({
      userId: dto.userId,
      roleId: dto.roleId,
      scopeType: dto.scopeType,
      scopeId: dto.scopeId,
      expiresAt: dto.expiresAt,
    });
  }

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revoke a user-role-assignment' })
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-role-assignments' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
