import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleCategoriesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or example model' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
