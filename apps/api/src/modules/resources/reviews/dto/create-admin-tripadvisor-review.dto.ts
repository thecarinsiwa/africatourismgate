import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const REVIEW_STATUSES = ['pending', 'approved', 'hidden'] as const;

export class CreateAdminTripadvisorReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ maxLength: 180 })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiProperty({ description: 'Review text (required for Tripadvisor entries)' })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiProperty({
    maxLength: 120,
    description: 'Display name shown on the public homepage',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  authorName!: string;

  @ApiPropertyOptional({
    enum: REVIEW_STATUSES,
    description: 'Defaults to approved so the review can appear on the homepage',
  })
  @IsOptional()
  @IsIn(REVIEW_STATUSES)
  status?: (typeof REVIEW_STATUSES)[number];
}
