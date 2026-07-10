import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { VEHICLE_REPORT_LOCALES } from '../vehicle-reports.constants';

export class VehicleReportsScopeQueryDto {
  @ApiPropertyOptional({ description: 'Search by license plate' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  agencyId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ enum: VEHICLE_REPORT_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn(VEHICLE_REPORT_LOCALES)
  locale?: (typeof VEHICLE_REPORT_LOCALES)[number];
}
