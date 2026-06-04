import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import type { Reviews } from '../../../../entities/generated';

const REVIEW_STATUSES = [
  'pending',
  'approved',
  'hidden',
] as const satisfies readonly Reviews['status'][];

export class ReviewsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ enum: REVIEW_STATUSES })
  @IsOptional()
  @IsIn(REVIEW_STATUSES)
  status?: Reviews['status'];

  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by accommodation property' })
  @IsOptional()
  @IsUUID('4')
  propertyId?: string;
}
