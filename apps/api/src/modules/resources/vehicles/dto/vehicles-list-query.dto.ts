import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehiclesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by license plate' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  agencyId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Filtre catalogue : produits partagés (NULL) + exclusifs de cette organisation',
  })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;
}
