import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class CruiseSearchQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: 'CDKIN', description: 'Departure cruise port code' })
  @Matches(/^[A-Za-z0-9]{2,16}$/, {
    message: 'sailFrom must be a valid port code (2–16 alphanumeric characters)',
  })
  sailFrom!: string;

  @ApiProperty({ example: 'CDBNW', description: 'Arrival cruise port code' })
  @Matches(/^[A-Za-z0-9]{2,16}$/, {
    message: 'sailTo must be a valid port code (2–16 alphanumeric characters)',
  })
  sailTo!: string;

  @ApiProperty({ format: 'date', example: '2026-09-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ format: 'date', example: '2026-09-30' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number = 1;
}
