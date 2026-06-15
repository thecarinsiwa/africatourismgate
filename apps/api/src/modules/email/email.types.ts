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
  /** Public site URL for CTAs (defaults to https://africatourismgate.org). */
  webUrl?: string;
};

export type BookingConfirmationEmailPayload = {
  to: string;
  firstName: string;
  bookingId: string;
  totalCents: number;
  currency: string;
  itemTitles: string[];
  /** ISO 8601 date of confirmation (e.g. booking.updatedAt). */
  confirmedAt: string;
  webUrl?: string;
};

export type OperationAlertEmailPayload = {
  to: string;
  firstName: string;
  purpose: 'register' | 'google_signup' | 'login' | 'booking';
  code: string;
  expiresInMinutes: number;
  verificationId: string;
  metadata?: Record<string, unknown>;
  webUrl?: string;
};

export type AbandonmentReminderEmailPayload = {
  to: string;
  firstName: string;
  purpose: 'register' | 'google_signup' | 'login' | 'booking';
  verificationId: string;
  webUrl?: string;
};

export type LoginNotificationEmailPayload = {
  to: string;
  firstName: string;
  webUrl?: string;
};
