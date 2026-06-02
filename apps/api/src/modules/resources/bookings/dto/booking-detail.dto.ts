import { BookingItems, Bookings } from '../../../../entities/generated';
import { ReviewDto } from '../../reviews/dto/review.dto';

export type BookingDetailDto = {
  booking: Bookings;
  items: BookingItems[];
  totalCents: number;
  currency: string;
  review?: ReviewDto | null;
  canReview?: boolean;
};
