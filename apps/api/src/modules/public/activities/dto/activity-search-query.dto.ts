import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ActivitySearchQueryDto extends PaginationQueryDto {
  @ApiProperty({
    example: 'Kinshasa',
    description: 'Destination city name (partial match)',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  destination!: string;

  @ApiProperty({ format: 'date', example: '2026-07-20' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants?: number = 1;
}
