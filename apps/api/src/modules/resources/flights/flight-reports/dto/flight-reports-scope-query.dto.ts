import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { FLIGHT_REPORT_LOCALES } from '../flight-reports.constants';

export class FlightReportsScopeQueryDto {
  @ApiPropertyOptional({ description: 'Search by flight number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  search?: string;

  @ApiPropertyOptional({ enum: FLIGHT_REPORT_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn(FLIGHT_REPORT_LOCALES)
  locale?: (typeof FLIGHT_REPORT_LOCALES)[number];
}
