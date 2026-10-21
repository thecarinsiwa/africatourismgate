import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { AccountingAuditService } from './accounting-audit.service';
import { AccountingAuditLogsListQueryDto } from './dto/accounting-audit-logs-list-query.dto';

@ApiTags('accounting-audit-logs')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('accounting-audit-logs')
export class AccountingAuditLogsController {
  constructor(private readonly service: AccountingAuditService) {}

  @RequirePermissions('accounting.audit.read')
  @Get()
  @ApiOperation({
    summary: 'List accounting audit logs (paginated, filtered)',
  })
  findAll(@Query() query: AccountingAuditLogsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('accounting.audit.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get accounting audit log by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
