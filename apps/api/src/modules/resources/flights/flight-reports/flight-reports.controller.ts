import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../rbac/decorators/require-permissions.decorator';
import { FlightReportsService } from './flight-reports.service';
import { FlightReportsDatedQueryDto } from './dto/flight-reports-dated-query.dto';
import { FlightReportsScopeQueryDto } from './dto/flight-reports-scope-query.dto';

function sendReportFile(
  res: Response,
  file: { buffer: Buffer; filename: string; contentType: string },
) {
  res.setHeader('Content-Type', file.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.filename)}"`,
  );
  res.send(file.buffer);
}

@ApiTags('flights')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('flights')
export class FlightReportsController {
  constructor(private readonly reportsService: FlightReportsService) {}

  @RequirePermissions('flights.read')
  @Get('reports/workbook')
  @ApiOperation({ summary: 'Export flights workbook (Excel, multi-sheet)' })
  async downloadWorkbook(
    @Query() query: FlightReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateWorkbook(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('flights.read')
  @Get('reports/pdf/kpi-summary')
  @ApiOperation({ summary: 'Export flights KPI summary PDF' })
  async downloadKpiSummaryPdf(
    @Query() query: FlightReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateKpiSummaryPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('flights.read')
  @Get('reports/pdf/catalog')
  @ApiOperation({ summary: 'Export flights catalog PDF' })
  async downloadCatalogPdf(
    @Query() query: FlightReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateCatalogPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('bookings.read')
  @Get('reports/pdf/bookings')
  @ApiOperation({ summary: 'Export flight bookings PDF for a date range' })
  async downloadBookingsPdf(
    @Query() query: FlightReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateBookingsPdf(query);
    sendReportFile(res, file);
  }
}
