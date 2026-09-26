import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingItems, Bookings, Payments } from '../../../../entities/generated';
import type { BookingStatusHistoryEntry } from '../booking-status-history.service';
import type { BookingIdentityDocumentDto } from './booking-identity-document.dto';
import type { BookingPaymentProofDto } from './booking-payment-proof.dto';
import { BookingEmergencyContactDto } from './booking-emergency-contact.dto';

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

  @ApiProperty({ description: 'Somme des paiements succeeded (centimes)' })
  paidCents!: number;

  @ApiProperty({ description: 'Solde restant (centimes)' })
  balanceCents!: number;

  @ApiProperty({
    description: 'Montant du premier encaissement attendu (acompte ou total)',
  })
  depositRequiredCents!: number;

  @ApiPropertyOptional({
    type: BookingEmergencyContactDto,
    nullable: true,
    description: 'Single emergency contact for the whole reservation.',
  })
  emergencyContact?: BookingEmergencyContactDto | null;

  @ApiProperty({ type: BookingClientDto })
  client!: BookingClientDto;

  @ApiProperty({ type: [Object] })
  payments!: Payments[];

  @ApiProperty({ type: [Object] })
  statusHistory!: BookingStatusHistoryEntry[];

  @ApiPropertyOptional({ type: [Object] })
  identityDocuments?: BookingIdentityDocumentDto[];

  @ApiPropertyOptional({ type: [Object] })
  paymentProofs?: BookingPaymentProofDto[];

  @ApiPropertyOptional({
    description: 'Unread customer messages for staff on this booking thread.',
  })
  unreadCustomerMessageCount?: number;
}
