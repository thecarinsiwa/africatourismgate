'use client';

import type { BookingDetail, BookingStatus } from '@africatourismgate/types';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../lib/api/account';
import { isAssistedBookingDetail } from '../components/account/booking-status-timeline';
import { AUTH_CHANGED_EVENT, hasWebSession } from '../lib/auth/client-session';

const TERMINAL_STATUSES = new Set<BookingStatus>(['cancelled', 'refunded']);
const REFRESH_INTERVAL_MS = 60_000;

export type ActiveAssistedBooking = {
  id: string;
  unreadCount: number;
  canReply: boolean;
};

function toActiveAssistedBooking(detail: BookingDetail): ActiveAssistedBooking {
  const status = detail.booking.status;
  return {
    id: detail.booking.id,
    unreadCount: detail.unreadStaffMessageCount ?? 0,
    canReply: status !== 'cancelled' && status !== 'refunded',
  };
}

async function resolveActiveAssistedBooking(): Promise<ActiveAssistedBooking | null> {
  const client = await getAccountApiClient();
  const { data } = await client.listBookings({ limit: 50, sortOrder: 'desc' });
  const candidates = data.filter((booking) => !TERMINAL_STATUSES.has(booking.status));

  for (const booking of candidates) {
    if (booking.status !== 'pending_approval') {
      continue;
    }
    const detail = await client.getBooking(booking.id);
    if ('booking' in detail && isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? [])) {
      return toActiveAssistedBooking(detail);
    }
  }

  for (const booking of candidates) {
    if (booking.status === 'pending_approval') {
      continue;
    }
    const detail = await client.getBooking(booking.id);
    if ('booking' in detail && isAssistedBookingDetail(detail.booking.status, detail.statusHistory ?? [])) {
      return toActiveAssistedBooking(detail);
    }
  }

  return null;
}

export function useActiveAssistedBooking(): ActiveAssistedBooking | null {
  const [booking, setBooking] = useState<ActiveAssistedBooking | null>(null);

  const refresh = useCallback(async () => {
    if (!hasWebSession()) {
      setBooking(null);
      return;
    }
    try {
      const active = await resolveActiveAssistedBooking();
      setBooking(active);
    } catch {
      setBooking(null);
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

  return booking;
}
