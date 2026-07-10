import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { FlightReportsScopeQueryDto } from './flight-reports-scope-query.dto';

export class FlightReportsDatedQueryDto extends FlightReportsScopeQueryDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  dateTo!: string;
}
