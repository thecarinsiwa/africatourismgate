import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { TreasuryAuditLogsListQueryDto } from './dto/treasury-audit-logs-list-query.dto';
import { TreasuryAuditService } from './treasury-audit.service';

@ApiTags('treasury-audit-logs')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('treasury-audit-logs')
export class TreasuryAuditLogsController {
  constructor(private readonly service: TreasuryAuditService) {}

  @RequirePermissions('treasury.audit.read')
  @Get()
  @ApiOperation({
    summary: 'List treasury audit logs (paginated, filtered)',
  })
  findAll(@Query() query: TreasuryAuditLogsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.audit.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get treasury audit log by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
