'use client';

import type { StaffNotification, StaffNotificationType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../auth/api';
import type {
  AdminNotificationItem,
  AdminNotificationsCounts,
  AdminNotificationsState,
} from './types';

const POLL_INTERVAL_MS = 45_000;
const LEGACY_STORAGE_KEY = 'atg_admin_read_notifications';

const TYPE_TO_CATEGORY: Record<
  StaffNotificationType,
  AdminNotificationItem['category']
> = {
  booking_pending_approval: 'booking',
  booking_client_message: 'message',
  review_pending: 'review',
  support_ticket_open: 'support',
};

function shortId(id: string | undefined): string {
  if (!id) return '';
  return `#${id.slice(0, 8)}`;
}

function clearLegacyReadStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function mapToItem(
  row: StaffNotification,
  titleForCategory: (category: AdminNotificationItem['category']) => string,
): AdminNotificationItem {
  const category = TYPE_TO_CATEGORY[row.type] ?? 'booking';
  const p = row.payload;
  const author = p.authorName?.trim();

  let description = '';
  switch (row.type) {
    case 'booking_pending_approval':
      description = [shortId(p.bookingId), author].filter(Boolean).join(' · ');
      break;
    case 'booking_client_message':
      description = [author, shortId(p.bookingId)].filter(Boolean).join(' · ');
      break;
    case 'review_pending':
      description = author || shortId(p.reviewId);
      break;
    case 'support_ticket_open':
      description = [author, shortId(p.ticketId)].filter(Boolean).join(' · ');
      break;
    default:
      description = shortId(p.bookingId || p.reviewId || p.ticketId);
  }

  return {
    id: row.id,
    category,
    title: titleForCategory(category),
    description,
    href: p.href || '/notifications',
    createdAt: row.createdAt,
    priority: p.priority ?? 'normal',
    unread: row.readAt == null,
    meta: {
      bookingId: p.bookingId,
      reviewId: p.reviewId,
      ticketId: p.ticketId,
      authorName: p.authorName,
      status: p.status,
      amountCents: p.amountCents,
      currency: p.currency,
    },
  };
}

export function useAdminNotifications(): AdminNotificationsState {
  const t = useTranslations('common.notifications');
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const fetchLockRef = useRef(false);

  const titleForCategory = useCallback(
    (category: AdminNotificationItem['category']) => t(`categories.${category}`),
    [t],
  );

  const fetchNotifications = useCallback(async () => {
    if (fetchLockRef.current) return;
    fetchLockRef.current = true;
    setError(null);

    try {
      const rows = await getApiClient().listStaffNotifications({ limit: 50 });
      setItems(rows.map((row) => mapToItem(row, titleForCategory)));
      setLastFetchedAt(new Date());
    } catch {
      setError('Impossible de synchroniser les notifications.');
    } finally {
      setLoading(false);
      fetchLockRef.current = false;
    }
  }, [titleForCategory]);

  useEffect(() => {
    clearLegacyReadStorage();
    void fetchNotifications();

    const interval = setInterval(() => {
      void fetchNotifications();
    }, POLL_INTERVAL_MS);

    function handleFocus() {
      void fetchNotifications();
    }

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
    void getApiClient()
      .markStaffNotificationRead(id)
      .catch(() => {
        void fetchNotifications();
      });
  }, [fetchNotifications]);

  const markAsUnread = useCallback((_id: string) => {
    // Server API is write-once for read_at in V1; unread stays until next server event.
  }, []);

  const toggleRead = useCallback(
    (id: string) => {
      const current = items.find((item) => item.id === id);
      if (current?.unread) {
        markAsRead(id);
      }
    },
    [items, markAsRead],
  );

  const markAllAsRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    void getApiClient()
      .markAllStaffNotificationsRead()
      .catch(() => {
        void fetchNotifications();
      });
  }, [fetchNotifications]);

  const counts: AdminNotificationsCounts = useMemo(() => {
    const byCategory = {
      booking: 0,
      message: 0,
      review: 0,
      support: 0,
    };
    let unread = 0;
    for (const item of items) {
      if (item.unread) {
        unread++;
        byCategory[item.category] += 1;
      }
    }
    return {
      total: items.length,
      unread,
      byCategory,
    };
  }, [items]);

  return {
    items,
    unreadCount: counts.unread,
    counts,
    loading,
    error,
    lastFetchedAt,
    refresh: fetchNotifications,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
  };
}
