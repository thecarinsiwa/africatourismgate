import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Bookings, BookingGuideAssignments, Users } from '../../../../entities/generated';

export class TourGuideBookingListItemDto {
  @ApiProperty({ format: 'uuid' })
  assignmentId!: string;

  @ApiProperty({ enum: ['primary', 'secondary'] })
  role!: BookingGuideAssignments['role'];

  @ApiProperty()
  assignedAt!: string;

  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty()
  status!: Bookings['status'];

  @ApiProperty()
  totalCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  clientEmail!: string;

  @ApiProperty()
  clientFirstName!: string;

  @ApiProperty()
  clientLastName!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;
}

function formatTimestamp(value: Date | string | null | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toTourGuideBookingListItemDto(
  assignment: BookingGuideAssignments,
  booking: Bookings,
  client: Users | undefined,
): TourGuideBookingListItemDto {
  return {
    assignmentId: assignment.id,
    role: assignment.role,
    assignedAt: formatTimestamp(assignment.assignedAt),
    bookingId: booking.id,
    status: booking.status,
    totalCents: booking.totalCents,
    currency: booking.currency,
    createdAt: formatTimestamp(booking.createdAt),
    clientEmail: client?.email ?? '—',
    clientFirstName: client?.firstName ?? '',
    clientLastName: client?.lastName ?? '',
    organizationId: client?.organizationId ?? null,
  };
}
