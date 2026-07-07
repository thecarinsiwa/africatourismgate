'use client';

import type { BookingListItem, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAssistedBookingDetail } from '../components/account/booking-status-timeline';
import { getAccountApiClient } from '../lib/api/account';
import { AUTH_CHANGED_EVENT, hasWebSession } from '../lib/auth/client-session';

const TERMINAL_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);
const REFRESH_INTERVAL_MS = 20_000;

export type AssistedBookingChatItem = {
  id: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
  unreadCount: number;
  canReply: boolean;
  actionRequired: boolean;
};

async function resolveAssistedBooking(
  booking: BookingListItem,
): Promise<AssistedBookingChatItem | null> {
  const client = await getAccountApiClient();

  if (booking.status === 'pending_approval') {
    const [detail, unread] = await Promise.all([
      client.getBooking(booking.id),
      client.getBookingUnreadMessageCount(booking.id),
    ]);
    if (!('booking' in detail)) {
      return null;
    }
    if (!isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? [])) {
      return null;
    }
    return {
      id: booking.id,
      status: booking.status,
      totalCents: booking.totalCents,
      currency: booking.currency,
      createdAt: booking.createdAt,
      unreadCount: unread.count,
      canReply:
        detail.booking.status !== 'cancelled' && detail.booking.status !== 'refunded',
      actionRequired: Boolean(booking.actionRequired),
    };
  }

  const detail = await client.getBooking(booking.id);
  if (!('booking' in detail)) {
    return null;
  }
  if (!isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? [])) {
    return null;
  }
  const unread = await client.getBookingUnreadMessageCount(booking.id);
  return {
    id: booking.id,
    status: booking.status,
    totalCents: booking.totalCents,
    currency: booking.currency,
    createdAt: booking.createdAt,
    unreadCount: unread.count,
    canReply: detail.booking.status !== 'cancelled' && detail.booking.status !== 'refunded',
    actionRequired: Boolean(booking.actionRequired),
  };
}

async function fetchAssistedBookings(): Promise<AssistedBookingChatItem[]> {
  const client = await getAccountApiClient();
  const { data } = await client.listBookings({ limit: 50, sortOrder: 'desc' });
  const candidates = data.filter((booking) => !TERMINAL_STATUSES.has(booking.status));

  const resolved = await Promise.all(candidates.map((booking) => resolveAssistedBooking(booking)));
  return resolved.filter((item): item is AssistedBookingChatItem => item !== null);
}

export function useAssistedBookingsChat() {
  const [items, setItems] = useState<AssistedBookingChatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasWebSession()) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const next = await fetchAssistedBookings();
      setItems(next);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onAuthChanged = () => {
      void refresh();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener('storage', onAuthChanged);

    const intervalId = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener('storage', onAuthChanged);
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const totalUnread = useMemo(
    () => items.reduce((sum, item) => sum + item.unreadCount, 0),
    [items],
  );

  return { items, totalUnread, loading, refresh };
}
