export type AdminNotificationCategory = 'all' | 'booking' | 'message' | 'review' | 'support';

export type AdminNotificationPriority = 'high' | 'normal' | 'low';

export type AdminNotificationItem = {
  id: string;
  category: Exclude<AdminNotificationCategory, 'all'>;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  priority: AdminNotificationPriority;
  unread: boolean;
  meta?: {
    bookingId?: string;
    reviewId?: string;
    ticketId?: string;
    authorName?: string;
    status?: string;
    amountCents?: number;
    currency?: string;
  };
};

export type AdminNotificationsCounts = {
  total: number;
  unread: number;
  byCategory: Record<Exclude<AdminNotificationCategory, 'all'>, number>;
};

export type AdminNotificationsState = {
  items: AdminNotificationItem[];
  unreadCount: number;
  counts: AdminNotificationsCounts;
  loading: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};
