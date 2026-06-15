import { BookingDetailDto } from './booking-detail.dto';

export type CreateBookingResponseDto = BookingDetailDto & {
  requiresVerification?: boolean;
  verificationId?: string;
};
