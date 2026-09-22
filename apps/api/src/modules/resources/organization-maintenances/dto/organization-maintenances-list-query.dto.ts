import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { SITE_MAINTENANCE_LOCALES } from '@africatourismgate/types';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class OrganizationMaintenancesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiPropertyOptional({ enum: SITE_MAINTENANCE_LOCALES })
  @IsOptional()
  @IsIn([...SITE_MAINTENANCE_LOCALES], {
    message: 'locale doit être fr, en ou es.',
  })
  locale?: string;
}
