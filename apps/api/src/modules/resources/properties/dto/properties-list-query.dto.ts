import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PropertiesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Filtre catalogue : produits partagés (NULL) + exclusifs de cette organisation',
  })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;
}
