import { ApiProperty } from '@nestjs/swagger';
import type { BookingStatus } from '@africatourismgate/types';

export const BOOKING_REQUEST_REGISTERED_MESSAGE =
  'Demande enregistrée — en attente de validation';

export class BookingRequestResponseDto {
  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty({ enum: ['pending_approval'] })
  status!: Extract<BookingStatus, 'pending_approval'>;

  @ApiProperty({ example: BOOKING_REQUEST_REGISTERED_MESSAGE })
  message!: string;

  @ApiProperty({ example: 9000 })
  totalCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}
