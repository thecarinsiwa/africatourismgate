import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TourGuideCalendarSummaryDayDto {
  @ApiProperty({ example: '2026-08-01' })
  date!: string;

  @ApiProperty()
  available!: number;

  @ApiProperty()
  occupied!: number;

  @ApiProperty()
  unavailable!: number;

  @ApiProperty()
  totalActive!: number;
}

export class TourGuideCalendarSummaryDto {
  @ApiProperty({ example: '2026-08' })
  month!: string;

  @ApiProperty({ type: [TourGuideCalendarSummaryDayDto] })
  days!: TourGuideCalendarSummaryDayDto[];
}

export class TourGuideCalendarDayGuideDto {
  @ApiProperty({ format: 'uuid' })
  guideId!: string;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  photoUrl!: string | null;

  @ApiProperty({ enum: ['available', 'occupied', 'unavailable'] })
  status!: 'available' | 'occupied' | 'unavailable';

  @ApiPropertyOptional({ format: 'uuid' })
  bookingId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  assignmentId?: string;

  @ApiPropertyOptional({ enum: ['primary', 'secondary'] })
  role?: 'primary' | 'secondary';

  @ApiProperty({ type: () => [GuideCalendarScheduleSlotDto] })
  slots!: GuideCalendarScheduleSlotDto[];
}

export class GuideCalendarScheduleSlotDto {
  @ApiProperty({ enum: ['assignment', 'unavailable'] })
  type!: 'assignment' | 'unavailable';

  @ApiProperty()
  startDatetime!: string;

  @ApiProperty()
  endDatetime!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  assignmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  bookingId?: string;

  @ApiPropertyOptional({ enum: ['primary', 'secondary'] })
  role?: 'primary' | 'secondary';

  @ApiPropertyOptional({ format: 'uuid' })
  availabilityId?: string;
}

export class TourGuideCalendarDayDetailDto {
  @ApiProperty({ example: '2026-08-15' })
  date!: string;

  @ApiProperty({ type: [TourGuideCalendarDayGuideDto] })
  guides!: TourGuideCalendarDayGuideDto[];
}

export class GuideAvailabilitySlotDto {
  @ApiProperty({ format: 'uuid' })
  guideId!: string;

  @ApiPropertyOptional({ example: '2026-08-15' })
  date?: string;

  @ApiProperty()
  startDatetime!: string;

  @ApiProperty()
  endDatetime!: string;

  @ApiProperty({ enum: ['available', 'unavailable'] })
  status!: 'available' | 'unavailable';
}
