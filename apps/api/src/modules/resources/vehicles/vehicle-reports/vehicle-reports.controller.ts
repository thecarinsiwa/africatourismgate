import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../rbac/decorators/require-permissions.decorator';
import { VehicleReportsService } from './vehicle-reports.service';
import { VehicleReportsDatedQueryDto } from './dto/vehicle-reports-dated-query.dto';
import { VehicleReportsScopeQueryDto } from './dto/vehicle-reports-scope-query.dto';

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

@ApiTags('vehicles')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('vehicles')
export class VehicleReportsController {
  constructor(private readonly reportsService: VehicleReportsService) {}

  @RequirePermissions('vehicles.read')
  @Get('reports/workbook')
  @ApiOperation({ summary: 'Export vehicles workbook (Excel, multi-sheet)' })
  async downloadWorkbook(
    @Query() query: VehicleReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateWorkbook(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('vehicles.read')
  @Get('reports/pdf/kpi-summary')
  @ApiOperation({ summary: 'Export vehicles KPI summary PDF' })
  async downloadKpiSummaryPdf(
    @Query() query: VehicleReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateKpiSummaryPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('vehicles.read')
  @Get('reports/pdf/catalog')
  @ApiOperation({ summary: 'Export vehicles catalog PDF' })
  async downloadCatalogPdf(
    @Query() query: VehicleReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateCatalogPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('bookings.read')
  @Get('reports/pdf/bookings')
  @ApiOperation({ summary: 'Export vehicle bookings PDF for a date range' })
  async downloadBookingsPdf(
    @Query() query: VehicleReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateBookingsPdf(query);
    sendReportFile(res, file);
  }
}
