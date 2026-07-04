import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingItems, Bookings, Payments } from '../../../../entities/generated';
import type { BookingStatusHistoryEntry } from '../booking-status-history.service';
import type { BookingIdentityDocumentDto } from './booking-identity-document.dto';

export class BookingClientDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  organizationName!: string | null;
}

export class BookingAdminDetailDto {
  @ApiProperty()
  booking!: Bookings;

  @ApiProperty({ type: [Object] })
  items!: BookingItems[];

  @ApiProperty()
  totalCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ type: BookingClientDto })
  client!: BookingClientDto;

  @ApiProperty({ type: [Object] })
  payments!: Payments[];

  @ApiProperty({ type: [Object] })
  statusHistory!: BookingStatusHistoryEntry[];

  @ApiPropertyOptional({ type: [Object] })
  identityDocuments?: BookingIdentityDocumentDto[];

  @ApiPropertyOptional({
    description: 'Unread customer messages for staff on this booking thread.',
  })
  unreadCustomerMessageCount?: number;
}
