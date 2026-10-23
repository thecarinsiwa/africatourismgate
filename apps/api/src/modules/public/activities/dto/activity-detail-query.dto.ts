import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class ActivityDetailQueryDto {
  /** When omitted, returns activity metadata with an empty schedules list. */
  @ApiPropertyOptional({ format: 'date', example: '2026-07-20' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants?: number = 1;
}
