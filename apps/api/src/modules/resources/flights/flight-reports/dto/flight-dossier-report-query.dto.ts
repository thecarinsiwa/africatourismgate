import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { FLIGHT_REPORT_LOCALES } from '../flight-reports.constants';

export class FlightDossierReportQueryDto {
  @ApiPropertyOptional({ enum: FLIGHT_REPORT_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn(FLIGHT_REPORT_LOCALES)
  locale?: (typeof FLIGHT_REPORT_LOCALES)[number];
}
