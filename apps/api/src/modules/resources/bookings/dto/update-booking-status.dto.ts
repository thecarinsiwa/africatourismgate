import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Bookings } from '../../../../entities/generated';

const BOOKING_STATUSES = [
  'draft',
  'pending_approval',
  'pending_payment',
  'confirmed',
  'cancelled',
  'refunded',
] as const satisfies readonly Bookings['status'][];

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BOOKING_STATUSES })
  @IsIn(BOOKING_STATUSES)
  status!: Bookings['status'];

  @ApiPropertyOptional({ description: 'Commentaire enregistré dans l’historique' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
