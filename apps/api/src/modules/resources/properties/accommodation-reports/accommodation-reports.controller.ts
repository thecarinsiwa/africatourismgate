import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../rbac/decorators/require-permissions.decorator';
import { AccommodationReportsService } from './accommodation-reports.service';
import { AccommodationReportsDatedQueryDto } from './dto/accommodation-reports-dated-query.dto';
import { AccommodationReportsScopeQueryDto } from './dto/accommodation-reports-scope-query.dto';
import { PropertyDossierReportQueryDto } from './dto/property-dossier-report-query.dto';

function sendReportFile(res: Response, file: { buffer: Buffer; filename: string; contentType: string }) {
  res.setHeader('Content-Type', file.contentType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.filename)}"`,
  );
  res.send(file.buffer);
}

@ApiTags('properties')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('properties')
export class AccommodationReportsController {
  constructor(private readonly reportsService: AccommodationReportsService) {}

  @RequirePermissions('properties.read')
  @Get('reports/workbook')
  @ApiOperation({ summary: 'Export accommodation workbook (Excel, multi-sheet)' })
  async downloadWorkbook(
    @Query() query: AccommodationReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateWorkbook(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('properties.read')
  @Get('reports/pdf/kpi-summary')
  @ApiOperation({ summary: 'Export accommodation KPI summary PDF' })
  async downloadKpiSummaryPdf(
    @Query() query: AccommodationReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateKpiSummaryPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('properties.read')
  @Get('reports/pdf/catalog')
  @ApiOperation({ summary: 'Export accommodation catalog PDF' })
  async downloadCatalogPdf(
    @Query() query: AccommodationReportsScopeQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateCatalogPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('bookings.read')
  @Get('reports/pdf/bookings')
  @ApiOperation({ summary: 'Export room bookings PDF for a date range' })
  async downloadBookingsPdf(
    @Query() query: AccommodationReportsDatedQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generateBookingsPdf(query);
    sendReportFile(res, file);
  }

  @RequirePermissions('properties.read')
  @Get(':id/reports/pdf/dossier')
  @ApiOperation({ summary: 'Export single property dossier PDF' })
  async downloadPropertyDossierPdf(
    @Param('id') id: string,
    @Query() query: PropertyDossierReportQueryDto,
    @Res() res: Response,
  ) {
    const file = await this.reportsService.generatePropertyDossierPdf(id, query.locale);
    sendReportFile(res, file);
  }
}
