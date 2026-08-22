import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class TourGuideBookingsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    description: 'Tri par date d’assignation (défaut desc)',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
