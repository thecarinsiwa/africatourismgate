import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ACTIVITY_BOOKING_REQUEST_STATUSES } from '../activities.constants';

export class UpdateActivityBookingRequestStatusDto {
  @ApiProperty({ enum: ACTIVITY_BOOKING_REQUEST_STATUSES })
  @IsIn([...ACTIVITY_BOOKING_REQUEST_STATUSES])
  status!: (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];
}