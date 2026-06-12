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

export class FlightSearchQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: 'FIH', description: 'Departure airport IATA code' })
  @Matches(/^[A-Za-z]{3}$/, { message: 'from must be a 3-letter IATA code' })
  from!: string;

  @ApiProperty({ example: 'NBO', description: 'Arrival airport IATA code' })
  @Matches(/^[A-Za-z]{3}$/, { message: 'to must be a 3-letter IATA code' })
  to!: string;

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
