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
import { UserSessions } from '../../../entities/generated';
import { UserSessionsService } from './user-sessions.service';

@ApiTags('user-sessions')
@Controller('user-sessions')
export class UserSessionsController {
  constructor(private readonly service: UserSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List user-sessions' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user-sessions by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user-sessions' })
  create(@Body() dto: DeepPartial<UserSessions>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user-sessions' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<UserSessions>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete user-sessions' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
