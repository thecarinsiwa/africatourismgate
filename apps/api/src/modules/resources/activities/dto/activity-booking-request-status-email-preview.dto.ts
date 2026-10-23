import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ACTIVITY_BOOKING_REQUEST_STATUSES } from '../activities.constants';

export class ActivityBookingRequestStatusEmailPreviewRequestDto {
  @ApiProperty({ enum: ACTIVITY_BOOKING_REQUEST_STATUSES })
  @IsIn([...ACTIVITY_BOOKING_REQUEST_STATUSES])
  status!: (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];
}

export class ActivityBookingRequestStatusEmailPreviewDto {
  @ApiProperty()
  subject!: string;

  @ApiProperty({ description: 'HTML complet du message' })
  html!: string;

  @ApiProperty({ description: 'Version texte brut' })
  text!: string;

  @ApiProperty({
    enum: ['available', 'unavailable', 'in_progress', 'pending_review'],
  })
  availability!:
    | 'available'
    | 'unavailable'
    | 'in_progress'
    | 'pending_review';

  @ApiProperty({ enum: ACTIVITY_BOOKING_REQUEST_STATUSES })
  status!: (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];
}
