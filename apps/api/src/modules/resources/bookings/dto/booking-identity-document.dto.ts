import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  BookingIdentityDocumentStatus,
  BookingIdentityDocumentType,
} from '../../../../entities/booking-identity-document.entity';

export class BookingIdentityDocumentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['passport', 'national_id', 'drivers_license', 'other'] })
  documentType!: BookingIdentityDocumentType;

  @ApiProperty()
  originalFilename!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  fileSizeBytes!: number;

  @ApiProperty({
    enum: ['pending_review', 'approved', 'resubmit_requested', 'rejected'],
  })
  status!: BookingIdentityDocumentStatus;

  @ApiPropertyOptional()
  staffNote?: string | null;

  @ApiPropertyOptional()
  reviewedByUserId?: string | null;

  @ApiPropertyOptional()
  reviewedAt?: string | null;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  createdAt!: string;
}

export class ReviewBookingIdentityDocumentDto {
  @ApiPropertyOptional({ description: 'Note for the customer (required for resubmit request)' })
  staffNote?: string;
}
