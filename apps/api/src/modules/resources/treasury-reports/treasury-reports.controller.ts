import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { TreasuryReportsByDimensionQueryDto } from './dto/treasury-reports-by-dimension-query.dto';
import { TreasuryReportsExportQueryDto } from './dto/treasury-reports-export-query.dto';
import { TreasuryReportsSummaryQueryDto } from './dto/treasury-reports-summary-query.dto';
import { TreasuryReportsService } from './treasury-reports.service';

function sendCsvFile(
  res: Response,
  file: { buffer: Buffer; filename: string; contentType: string },
): void {
  res.setHeader('Content-Type', file.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.filename)}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
  );
  res.send(file.buffer);
}

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

  @RequirePermissions('treasury.reports.read')
  @Get('export')
  @ApiProduces('text/csv')
  @ApiOperation({
    summary:
      'Export fund entries and/or exits as UTF-8 CSV (BOM) — filters aligned with lists/reports',
  })
  async exportCsv(
    @Query() query: TreasuryReportsExportQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.service.exportCsv(query);
    sendCsvFile(res, file);
  }
}
