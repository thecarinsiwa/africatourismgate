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

  @ApiProperty({ example: 'Tourism Gate Experiences Kinshasa' })
  providerName!: string;

  @ApiProperty({ example: 1 })
  availableSchedulesCount!: number;

  @ApiPropertyOptional({ example: '2026-07-20T09:00:00.000Z' })
  nextStartDatetime?: string;
}
