export type StaffNotificationType =
  | 'booking_pending_approval'
  | 'booking_client_message'
  | 'review_pending'
  | 'support_ticket_open'
  | 'activity_booking_request';

export type StaffNotificationPriority = 'high' | 'normal' | 'low';

/** Structured payload stored in `notifications.payload` (titles via admin i18n). */
export type StaffNotificationPayload = {
  href: string;
  priority: StaffNotificationPriority;
  bookingId?: string;
  messageId?: string;
  reviewId?: string;
  ticketId?: string;
  /** Activity 0-slot inquiry (`activity_booking_requests`). */
  requestId?: string;
  activityId?: string;
  activityTitle?: string;
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
