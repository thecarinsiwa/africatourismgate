import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Kinshasa',
    description: 'Pickup city or destination name (partial match). Omit to search all cities.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  pickupLocation?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-08-01',
    description: 'When omitted, uses the earliest availability window per vehicle',
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-08-08' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
