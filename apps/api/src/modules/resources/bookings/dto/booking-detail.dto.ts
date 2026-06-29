import { BookingItems, Bookings } from '../../../../entities/generated';
import { ReviewDto } from '../../reviews/dto/review.dto';
import type { BookingStatusHistoryEntry } from '../booking-status-history.service';
import type { GuideReviewInviteDto } from './guide-review-invite.dto';

export type BookingDetailDto = {
  booking: Bookings;
  items: BookingItems[];
  totalCents: number;
  currency: string;
  review?: ReviewDto | null;
  canReview?: boolean;
  statusHistory?: BookingStatusHistoryEntry[];
  paymentInvited?: boolean;
  guideReviewInvites?: GuideReviewInviteDto[];
};
