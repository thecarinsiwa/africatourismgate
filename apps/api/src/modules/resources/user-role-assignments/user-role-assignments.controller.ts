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
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { UserRoleAssignments } from '../../../entities/generated';
import { UserRoleAssignmentsService } from './user-role-assignments.service';

@ApiTags('user-role-assignments')
@Controller('user-role-assignments')
export class UserRoleAssignmentsController {
  constructor(private readonly service: UserRoleAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-role-assignments' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-role-assignments by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-role-assignments' })
  create(@Body() dto: DeepPartial<UserRoleAssignments>) {
    return this.service.create(dto);
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
