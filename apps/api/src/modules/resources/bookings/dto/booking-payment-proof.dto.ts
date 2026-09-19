import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import type {
  BookingPaymentProofMethod,
  BookingPaymentProofStatus,
} from '../../../../entities/booking-payment-proof.entity';

export class BookingPaymentProofDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingId!: string;

  @ApiPropertyOptional({ nullable: true })
  paymentId!: string | null;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['bank_transfer', 'mobile_money'] })
  paymentMethod!: BookingPaymentProofMethod;

  @ApiProperty()
  originalFilename!: string;

  @ApiProperty()
  mimeType!: string;

  @ApiProperty()
  fileSizeBytes!: number;

  @ApiProperty({
    enum: ['pending_review', 'approved', 'resubmit_requested', 'rejected'],
  })
  status!: BookingPaymentProofStatus;

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

export class ReviewBookingPaymentProofDto {
  @ApiPropertyOptional({
    description: 'Note for the customer (required for resubmit request)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  staffNote?: string;
}
