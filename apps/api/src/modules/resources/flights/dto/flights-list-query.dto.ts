import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class FlightsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by flight number (code vol)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;
}
