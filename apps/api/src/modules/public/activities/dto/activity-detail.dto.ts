import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicGalleryImageDto } from '../../dto/public-gallery-image.dto';

export class ActivityDetailScheduleDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Schedule id for checkout referenceId (activity_schedule)',
  })
  scheduleId!: string;

  @ApiProperty()
  startDatetime!: string;

  @ApiProperty({ example: 12 })
  capacity!: number;

  @ApiProperty({ example: 2 })
  bookedCount!: number;

  @ApiProperty({ example: 10 })
  remainingPlaces!: number;

  @ApiProperty({ example: 4500 })
  priceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class ActivityDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Gombe City Tour' })
  title!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

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

  @ApiProperty({ format: 'date', example: '2026-07-20' })
  date!: string;

  @ApiProperty({ example: 2 })
  participants!: number;

  @ApiProperty({ type: [ActivityDetailScheduleDto] })
  schedules!: ActivityDetailScheduleDto[];

  @ApiProperty({ type: [PublicGalleryImageDto] })
  images!: PublicGalleryImageDto[];
}
