import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminReviewListItemDto } from './admin-review-list-item.dto';

export class AdminReviewDetailDto extends AdminReviewListItemDto {
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}
