import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class FlightDetailQueryDto {
  @ApiProperty({ format: 'date', example: '2026-08-01' })
  @IsDateString()
  departureDate!: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-08-08' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  passengers?: number = 1;
}
