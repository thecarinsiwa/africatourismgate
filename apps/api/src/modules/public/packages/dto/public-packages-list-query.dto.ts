import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PublicPackagesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by package name' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
