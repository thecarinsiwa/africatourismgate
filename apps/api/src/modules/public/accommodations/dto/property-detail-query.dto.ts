import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class PropertyDetailQueryDto {
  @ApiPropertyOptional({ format: 'date', example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-06-05' })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number = 1;

  @ApiPropertyOptional({ example: '2026-06', description: 'YYYY-MM for calendar' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}
