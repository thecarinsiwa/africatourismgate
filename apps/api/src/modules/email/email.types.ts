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
