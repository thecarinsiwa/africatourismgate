'use client';

import type { BookingDetail, BookingListItem, BookingStatus } from '@africatourismgate/types';
import { useMessages } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAssistedBookingDetail } from '../components/account/booking-status-timeline';
import { getAccountApiClient } from '../lib/api/account';
import { formatBookingDisplayName } from '../lib/bookings/display';
import { AUTH_CHANGED_EVENT, hasWebSession } from '../lib/auth/client-session';
import type { Translations } from '../lib/i18n/message-types';

const TERMINAL_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);
const REFRESH_INTERVAL_MS = 20_000;

export type AssistedBookingChatItem = {
  id: string;
  name: string;
  status: BookingStatus;
  totalCents: number;
  currency: string;
  createdAt: string;
  unreadCount: number;
  canReply: boolean;
  actionRequired: boolean;
};

function toAssistedBookingChatItem(
  booking: BookingListItem,
  detail: BookingDetail,
  unreadCount: number,
  itemTypeLabels: Record<string, string>,
): AssistedBookingChatItem {
  return {
    id: booking.id,
    name: formatBookingDisplayName(detail.items, itemTypeLabels),
    status: booking.status,
    totalCents: booking.totalCents,
    currency: booking.currency,
    createdAt: booking.createdAt,
    unreadCount,
    canReply:
      detail.booking.status !== 'cancelled' && detail.booking.status !== 'refunded',
    actionRequired: Boolean(booking.actionRequired),
  };
}

async function resolveAssistedBooking(
  booking: BookingListItem,
  itemTypeLabels: Record<string, string>,
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
    return toAssistedBookingChatItem(booking, detail, unread.count, itemTypeLabels);
  }

  const detail = await client.getBooking(booking.id);
  if (!('booking' in detail)) {
    return null;
  }
  if (!isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? [])) {
    return null;
  }
  const unread = await client.getBookingUnreadMessageCount(booking.id);
  return toAssistedBookingChatItem(booking, detail, unread.count, itemTypeLabels);
}

async function fetchAssistedBookings(
  itemTypeLabels: Record<string, string>,
): Promise<AssistedBookingChatItem[]> {
  const client = await getAccountApiClient();
  const { data } = await client.listBookings({ limit: 50, sortOrder: 'desc' });
  const candidates = data.filter((booking) => !TERMINAL_STATUSES.has(booking.status));

  const resolved = await Promise.all(
    candidates.map((booking) => resolveAssistedBooking(booking, itemTypeLabels)),
  );
  return resolved.filter((item): item is AssistedBookingChatItem => item !== null);
}

export function useAssistedBookingsChat() {
  const messages = useMessages();
  const itemTypeLabels = (
    messages as { account: Translations['account'] }
  ).account.reservations.itemTypes;
  const [items, setItems] = useState<AssistedBookingChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!hasWebSession()) {
      setItems([]);
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
    }
    try {
      const next = await fetchAssistedBookings(itemTypeLabels);
      setItems(next);
    } catch {
      // Keep last known list on background refresh failures to avoid FAB flicker.
      if (!silent && itemsRef.current.length === 0) {
        setItems([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [itemTypeLabels]);

  useEffect(() => {
    void refresh();

    const onAuthChanged = () => {
      void refresh();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener('storage', onAuthChanged);

    const intervalId = window.setInterval(() => {
      void refresh({ silent: true });
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
