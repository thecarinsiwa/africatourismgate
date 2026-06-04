export type SendMailResult = {
  sent: boolean;
  messageId?: string;
  previewUrl?: string;
};

export type PasswordResetEmailPayload = {
  to: string;
  firstName: string;
  resetUrl: string;
};

export type WelcomeEmailPayload = {
  to: string;
  firstName: string;
};

export type BookingConfirmationEmailPayload = {
  to: string;
  firstName: string;
  bookingId: string;
  totalCents: number;
  currency: string;
  itemTitles: string[];
};

/** Internal notification to the support team (new customer account). */
export type SupportNewAccountEmailPayload = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  preferredLanguage?: string | null;
};

/** Internal notification to the support team (booking confirmed). */
export type SupportNewBookingEmailPayload = {
  bookingId: string;
  userId: string;
  clientEmail: string;
  clientName: string;
  totalCents: number;
  currency: string;
  itemTitles: string[];
};
