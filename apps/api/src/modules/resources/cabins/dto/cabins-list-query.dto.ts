import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class CabinsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  shipId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Filtre catalogue : produits partagés (NULL) + exclusifs de cette organisation',
  })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;
}
