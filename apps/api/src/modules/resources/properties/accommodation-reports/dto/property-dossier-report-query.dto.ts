import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ACCOMMODATION_REPORT_LOCALES } from '../accommodation-reports.constants';

export class PropertyDossierReportQueryDto {
  @ApiPropertyOptional({ enum: ACCOMMODATION_REPORT_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn(ACCOMMODATION_REPORT_LOCALES)
  locale?: (typeof ACCOMMODATION_REPORT_LOCALES)[number];
}
