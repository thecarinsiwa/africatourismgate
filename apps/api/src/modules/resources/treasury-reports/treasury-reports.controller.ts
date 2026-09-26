import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { TreasuryReportsByDimensionQueryDto } from './dto/treasury-reports-by-dimension-query.dto';
import { TreasuryReportsSummaryQueryDto } from './dto/treasury-reports-summary-query.dto';
import { TreasuryReportsService } from './treasury-reports.service';

@ApiTags('treasury-reports')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('treasury-reports')
export class TreasuryReportsController {
  constructor(private readonly service: TreasuryReportsService) {}

  @RequirePermissions('treasury.reports.read')
  @Get('summary')
  @ApiOperation({
    summary:
      'Treasury summary totals (entries/exits) for a date range — excludes voided (and draft exits)',
  })
  getSummary(@Query() query: TreasuryReportsSummaryQueryDto) {
    return this.service.getSummary(query);
  }

  @RequirePermissions('treasury.reports.read')
  @Get('by-dimension')
  @ApiOperation({
    summary: 'Treasury totals grouped by source or payment method',
  })
  getByDimension(@Query() query: TreasuryReportsByDimensionQueryDto) {
    return this.service.getByDimension(query);
  }
}
