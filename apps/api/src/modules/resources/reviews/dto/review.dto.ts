import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating!: number;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  body!: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Reviewer first name (public display)' })
  authorFirstName!: string | null;

  @ApiProperty()
  createdAt!: string;
}

export class PropertyReviewSummaryDto {
  @ApiProperty({ nullable: true, description: 'Average rating rounded to one decimal' })
  averageRating!: number | null;

  @ApiProperty()
  reviewCount!: number;
}
