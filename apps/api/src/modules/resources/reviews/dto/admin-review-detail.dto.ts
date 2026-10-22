import { ApiPropertyOptional } from '@nestjs/swagger';
import { AdminReviewListItemDto } from './admin-review-list-item.dto';

export class AdminReviewDetailDto extends AdminReviewListItemDto {
  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Null for Tripadvisor / external reviews',
  })
  userId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}
