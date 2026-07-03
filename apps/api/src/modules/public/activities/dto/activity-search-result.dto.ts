import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivitySearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Gombe City Tour' })
  title!: string;

  @ApiPropertyOptional({ nullable: true, example: 180 })
  durationMinutes!: number | null;

  @ApiProperty({ example: 4500 })
  priceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 'Kinshasa' })
  destination!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Destination latitude for map display',
    example: -4.3217,
  })
  latitude?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Destination longitude for map display',
    example: 15.3125,
  })
  longitude?: number | null;

  @ApiProperty({ example: 'Tourism Gate Experiences Kinshasa' })
  providerName!: string;

  @ApiProperty({ example: 1 })
  availableSchedulesCount!: number;

  @ApiPropertyOptional({ example: '2026-07-20T09:00:00.000Z' })
  nextStartDatetime?: string;

  @ApiPropertyOptional({ nullable: true, description: 'First activity photo URL' })
  imageUrl!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    enum: ['easy', 'moderate', 'hard', 'expert'],
  })
  difficultyLevel!: 'easy' | 'moderate' | 'hard' | 'expert' | null;

  @ApiPropertyOptional({ nullable: true, description: 'Average guest review rating (1–5)' })
  averageRating?: number | null;

  @ApiPropertyOptional({ description: 'Number of approved guest reviews' })
  reviewCount?: number;
}
