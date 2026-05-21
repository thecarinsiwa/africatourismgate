import { BookingItems, Bookings } from '../../../../entities/generated';

export type BookingDetailDto = {
  booking: Bookings;
  items: BookingItems[];
  totalCents: number;
  currency: string;
};
