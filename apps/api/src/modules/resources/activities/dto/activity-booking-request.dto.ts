import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACTIVITY_BOOKING_REQUEST_STATUSES } from '../activities.constants';

export class ActivityBookingRequestDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  activityId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;

  @ApiProperty({ example: 'Jane Doe' })
  fullName!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiPropertyOptional({ nullable: true, example: '+250788123456' })
  phone!: string | null;

  @ApiProperty({ format: 'date', example: '2026-08-15' })
  preferredDate!: string;

  @ApiProperty({ example: 2 })
  participants!: number;

  @ApiPropertyOptional({ nullable: true })
  message!: string | null;

  @ApiProperty({ enum: ACTIVITY_BOOKING_REQUEST_STATUSES })
  status!: (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}
