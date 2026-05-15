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
import { RbacAuditLogs } from '../../../entities/generated';
import { RbacAuditLogsService } from './rbac-audit-logs.service';

@ApiTags('rbac-audit-logs')
@Controller('rbac-audit-logs')
export class RbacAuditLogsController {
  constructor(private readonly service: RbacAuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List rbac-audit-logs' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rbac-audit-logs by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create rbac-audit-logs' })
  create(@Body() dto: DeepPartial<RbacAuditLogs>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rbac-audit-logs' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<RbacAuditLogs>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete rbac-audit-logs' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
