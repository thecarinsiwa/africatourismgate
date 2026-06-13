import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class PackageResolveLinesQueryDto {
  @ApiProperty({ format: 'date', example: '2026-08-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ format: 'date', example: '2026-08-04' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  travelers!: number;
}
