import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class OrganizationsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or slug (partial match)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
