import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleAvailabilityListQueryDto extends PaginationQueryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  vehicleId!: string;

  @ApiPropertyOptional({ description: 'Filter slots overlapping from this datetime (ISO)' })
  @IsOptional()
  @IsDateString()
  startFrom?: string;

  @ApiPropertyOptional({ description: 'Filter slots overlapping until this datetime (ISO)' })
  @IsOptional()
  @IsDateString()
  endTo?: string;
}
