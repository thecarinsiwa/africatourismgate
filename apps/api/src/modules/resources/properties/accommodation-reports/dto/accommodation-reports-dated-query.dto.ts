import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { AccommodationReportsScopeQueryDto } from './accommodation-reports-scope-query.dto';

export class AccommodationReportsDatedQueryDto extends AccommodationReportsScopeQueryDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  dateTo!: string;
}
