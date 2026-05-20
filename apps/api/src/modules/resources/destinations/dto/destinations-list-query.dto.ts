import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class DestinationsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, slug or country code' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
