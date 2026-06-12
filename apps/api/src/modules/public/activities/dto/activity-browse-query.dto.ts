import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ActivityBrowseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Kinshasa',
    description: 'Optional destination city name (partial match)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  destination?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  participants?: number = 1;
}
