export type SendMailResult = {
  sent: boolean;
  messageId?: string;
  previewUrl?: string;
};

export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
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

export type AdminPendingRegistrationEmailPayload = {
  to: string;
  firstName: string;
  applicantName: string;
  applicantEmail: string;
  reviewUrl: string;
};

export type AdminAccountActivatedEmailPayload = {
  to: string;
  firstName: string;
  loginUrl: string;
  locale?: 'fr' | 'en' | 'es';
  roles?: string[];
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

export type AssistedBookingEmailBase = {
  to: string;
  firstName: string;
  bookingId: string;
  totalCents: number;
  currency: string;
  itemTitles: string[];
  webUrl?: string;
};

export type BookingRequestReceivedEmailPayload = AssistedBookingEmailBase;

export type BookingApprovedChatEmailPayload = AssistedBookingEmailBase & {
  chatUrl: string;
  locale?: 'fr' | 'en' | 'es';
  hasPdfAttachment?: boolean;
};

export type BookingRejectedEmailPayload = AssistedBookingEmailBase & {
  reason?: string | null;
};

export type BookingPaymentInviteEmailPayload = AssistedBookingEmailBase & {
  paymentUrl: string;
  travelerPricing?: Array<{ fullName: string; priceCents: number }>;
};

export type BookingStaffMessageEmailPayload = AssistedBookingEmailBase & {
  chatUrl: string;
  messagePreview: string;
};

export type BookingPaymentReminderEmailPayload = AssistedBookingEmailBase & {
  paymentUrl: string;
};
