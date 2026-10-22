import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { REVIEW_SOURCES, type ReviewSource } from '@africatourismgate/types';

export class AdminReviewListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating!: number;

  @ApiProperty({ enum: ['pending', 'approved', 'hidden'] })
  status!: 'pending' | 'approved' | 'hidden';

  @ApiProperty({ enum: REVIEW_SOURCES })
  source!: ReviewSource;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  authorFirstName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  authorEmail!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Display name for Tripadvisor / external reviews',
  })
  externalAuthorName!: string | null;

  @ApiProperty({
    enum: [
      'property',
      'flight',
      'vehicle',
      'cruise',
      'activity',
      'booking',
      'tour_guide',
      'tripadvisor',
    ],
  })
  entityType!: string;

  @ApiProperty({ format: 'uuid' })
  entityId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  propertyId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  propertyName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  guideName?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  guideId?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  bookingId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  body!: string | null;
}
