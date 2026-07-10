import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { VehicleReportsScopeQueryDto } from './vehicle-reports-scope-query.dto';

export class VehicleReportsDatedQueryDto extends VehicleReportsScopeQueryDto {
  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  dateTo!: string;
}
