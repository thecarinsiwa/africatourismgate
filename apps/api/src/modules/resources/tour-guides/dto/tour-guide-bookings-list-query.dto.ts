import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class TourGuideBookingsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Tri par date d’assignation (défaut desc)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Recherche par client, e-mail ou identifiant de réservation',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
