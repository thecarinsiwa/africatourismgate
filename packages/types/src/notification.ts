export type StaffNotificationType =
  | 'booking_pending_approval'
  | 'booking_client_message'
  | 'review_pending'
  | 'support_ticket_open';

export type StaffNotificationPriority = 'high' | 'normal' | 'low';

/** Structured payload stored in `notifications.payload` (titles via admin i18n). */
export type StaffNotificationPayload = {
  href: string;
  priority: StaffNotificationPriority;
  bookingId?: string;
  messageId?: string;
  reviewId?: string;
  ticketId?: string;
  authorName?: string;
  status?: string;
  amountCents?: number;
  currency?: string;
};

export interface StaffNotification {
  id: string;
  userId: string;
  type: StaffNotificationType;
  payload: StaffNotificationPayload;
  readAt: string | null;
  createdAt: string;
}

export type StaffNotificationsListQuery = {
  unreadOnly?: boolean;
  limit?: number;
};

export type StaffNotificationsUnreadCount = {
  count: number;
};
