'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getApiClient } from '../auth/api';
import { isApiForbidden } from '../auth/is-api-forbidden';
import { usePermissions } from '../auth/use-permissions';
import type {
  AdminNotificationItem,
  AdminNotificationsCounts,
  AdminNotificationsState,
} from './types';

const STORAGE_KEY = 'atg_admin_read_notifications';
const POLL_INTERVAL_MS = 45_000;

function getStoredReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((id): id is string => typeof id === 'string'));
    }
    return new Set();
  } catch {
    return new Set();
  }
}

function saveStoredReadIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    // Garde au maximum les 200 derniers IDs pour limiter la taille du stockage
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // Ignore localStorage errors
  }
}

export function useAdminNotifications(): AdminNotificationsState {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [rawItems, setRawItems] = useState<Omit<AdminNotificationItem, 'unread'>[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => getStoredReadIds());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchLockRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (permissionsLoading || fetchLockRef.current) return;
    fetchLockRef.current = true;
    setError(null);

    const client = getApiClient();
    const collected: Omit<AdminNotificationItem, 'unread'>[] = [];

    const tasks: Promise<void>[] = [];

    // 1. Demandes de réservation en attente (pending_approval)
    if (hasPermission('bookings.read')) {
      tasks.push(
        (async () => {
          try {
            const res = await client.listBookings({
              status: 'pending_approval',
              limit: 10,
              sortOrder: 'desc',
            });
            for (const b of res.data) {
              const name = `${b.clientFirstName || ''} ${b.clientLastName || ''}`.trim() || b.clientEmail;
              collected.push({
                id: `booking-pending-${b.id}`,
                category: 'booking',
                title: 'Demande de réservation',
                description: `Réservation #${b.id.slice(0, 8)} par ${name}`,
                href: `/reservations?search=${b.id}`,
                createdAt: b.createdAt,
                priority: 'high',
                meta: {
                  bookingId: b.id,
                  authorName: name,
                  status: b.status,
                  amountCents: b.totalCents,
                  currency: b.currency,
                },
              });
            }
          } catch (err) {
            if (!isApiForbidden(err)) {
              // Silencieux
            }
          }
        })(),
      );

      // 2. Nouveaux messages clients non lus sur les réservations
      tasks.push(
        (async () => {
          try {
            const res = await client.listBookings({
              limit: 15,
              sortOrder: 'desc',
            });
            const unreadMsgBookings = res.data.filter((b) => b.unreadCustomerMessage);
            for (const b of unreadMsgBookings) {
              const name = `${b.clientFirstName || ''} ${b.clientLastName || ''}`.trim() || b.clientEmail;
              collected.push({
                id: `booking-msg-${b.id}`,
                category: 'message',
                title: 'Nouveau message client',
                description: `Message de ${name} sur la réservation #${b.id.slice(0, 8)}`,
                href: `/reservations/${b.id}`,
                createdAt: b.updatedAt || b.createdAt,
                priority: 'normal',
                meta: {
                  bookingId: b.id,
                  authorName: name,
                },
              });
            }
          } catch (err) {
            if (!isApiForbidden(err)) {
              // Silencieux
            }
          }
        })(),
      );
    }

    // 3. Avis clients en attente de modération
    if (hasPermission('reviews.read')) {
      tasks.push(
        (async () => {
          try {
            const res = await client.listReviews({
              status: 'pending',
              limit: 10,
            });
            for (const r of res.data) {
              const author = r.authorFirstName || 'Client';
              const target = r.propertyName ? ` (${r.propertyName})` : '';
              collected.push({
                id: `review-pending-${r.id}`,
                category: 'review',
                title: 'Avis en attente',
                description: `Note ${r.rating}/5 par ${author}${target}`,
                href: `/contenu/avis`,
                createdAt: r.createdAt,
                priority: 'normal',
                meta: {
                  reviewId: r.id,
                  authorName: author,
                },
              });
            }
          } catch (err) {
            if (!isApiForbidden(err)) {
              // Silencieux
            }
          }
        })(),
      );
    }

    // 4. Tickets support ouverts
    if (hasPermission('support_tickets.read')) {
      tasks.push(
        (async () => {
          try {
            const res = await client.listSupportTickets({
              status: 'open',
              limit: 10,
            });
            for (const t of res.data) {
              const author = t.customerFirstName || 'Client';
              collected.push({
                id: `ticket-open-${t.id}`,
                category: 'support',
                title: 'Ticket support ouvert',
                description: `${t.subject} (${author})`,
                href: `/contenu/support`,
                createdAt: t.createdAt,
                priority: t.priority === 'urgent' || t.priority === 'high' ? 'high' : 'normal',
                meta: {
                  ticketId: t.id,
                  authorName: author,
                },
              });
            }
          } catch (err) {
            if (!isApiForbidden(err)) {
              // Silencieux
            }
          }
        })(),
      );
    }

    try {
      await Promise.all(tasks);
      // Tri par date de création décroissante
      collected.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRawItems(collected);
      setLastFetchedAt(new Date());
    } catch {
      setError('Impossible de synchroniser les notifications.');
    } finally {
      setLoading(false);
      fetchLockRef.current = false;
    }
  }, [hasPermission, permissionsLoading]);

  useEffect(() => {
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
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveStoredReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const item of rawItems) {
        next.add(item.id);
      }
      saveStoredReadIds(next);
      return next;
    });
  }, [rawItems]);

  const items: AdminNotificationItem[] = useMemo(() => {
    return rawItems.map((item) => ({
      ...item,
      unread: !readIds.has(item.id),
    }));
  }, [rawItems, readIds]);

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
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
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
    markAllAsRead,
  };
}
