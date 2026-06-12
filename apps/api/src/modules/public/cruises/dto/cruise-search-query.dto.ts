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
  @ApiPropertyOptional({ example: 'CDKIN', description: 'Departure cruise port code' })
  @IsOptional()
  @Matches(/^[A-Za-z0-9]{2,16}$/, {
    message: 'sailFrom must be a valid port code (2–16 alphanumeric characters)',
  })
  sailFrom?: string;

  @ApiPropertyOptional({ example: 'CDBNW', description: 'Arrival cruise port code' })
  @IsOptional()
  @Matches(/^[A-Za-z0-9]{2,16}$/, {
    message: 'sailTo must be a valid port code (2–16 alphanumeric characters)',
  })
  sailTo?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-09-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-09-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests?: number = 1;
}
