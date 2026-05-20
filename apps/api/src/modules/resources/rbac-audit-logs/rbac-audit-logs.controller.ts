import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuperAdminGuard } from '../../rbac/guards/super-admin.guard';
import { RbacAuditLogDto } from './dto/rbac-audit-log.dto';
import { RbacAuditLogsListQueryDto } from './dto/rbac-audit-logs-list-query.dto';
import { RbacAuditLogsService } from './rbac-audit-logs.service';

@ApiTags('rbac-audit-logs')
@Controller('rbac-audit-logs')
@UseGuards(SuperAdminGuard)
@ApiUnauthorizedResponse()
@ApiForbiddenResponse({ description: 'Super administrator only' })
export class RbacAuditLogsController {
  constructor(private readonly service: RbacAuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List RBAC audit logs (super admin only)' })
  findAll(@Query() query: RbacAuditLogsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RBAC audit log by id (super admin only)' })
  findOne(@Param('id') id: string): Promise<RbacAuditLogDto> {
    return this.service.findOne(id);
  }
}
