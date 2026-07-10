import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ACCOMMODATION_REPORT_LOCALES } from '../accommodation-reports.constants';

export class AccommodationReportsScopeQueryDto {
  @ApiPropertyOptional({ description: 'Search by property name or slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string;

  @ApiPropertyOptional({ enum: ACCOMMODATION_REPORT_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn(ACCOMMODATION_REPORT_LOCALES)
  locale?: (typeof ACCOMMODATION_REPORT_LOCALES)[number];
}
