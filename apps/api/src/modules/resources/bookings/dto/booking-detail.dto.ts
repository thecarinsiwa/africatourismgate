import { BookingItems, Bookings } from '../../../../entities/generated';
import { ReviewDto } from '../../reviews/dto/review.dto';
import type { BookingStatusHistoryEntry } from '../booking-status-history.service';
import type { GuideReviewInviteDto } from './guide-review-invite.dto';
import type { BookingIdentityDocumentDto } from './booking-identity-document.dto';
import type { BookingPaymentProofDto } from './booking-payment-proof.dto';
import type { BookingEmergencyContactDto } from './booking-emergency-contact.dto';

export type BookingDetailDto = {
  booking: Bookings;
  items: BookingItems[];
  totalCents: number;
  currency: string;
  paidCents: number;
  balanceCents: number;
  depositRequiredCents: number;
  /** Single emergency contact for the whole reservation. */
  emergencyContact?: BookingEmergencyContactDto | null;
  review?: ReviewDto | null;
  canReview?: boolean;
  statusHistory?: BookingStatusHistoryEntry[];
  paymentInvited?: boolean;
  guideReviewInvites?: GuideReviewInviteDto[];
  identityDocuments?: BookingIdentityDocumentDto[];
  paymentProofs?: BookingPaymentProofDto[];
  unreadStaffMessageCount?: number;
};
