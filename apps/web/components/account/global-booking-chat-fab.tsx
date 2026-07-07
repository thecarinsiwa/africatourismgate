'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookingChatFabIcon, DraggableFab, Modal } from '@africatourismgate/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  formatBookingDateTime,
  formatBookingMoney,
} from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import { useLocale, useTranslations } from '../../lib/i18n/locale-provider';
import {
  useAssistedBookingsChat,
  type AssistedBookingChatItem,
} from '../../hooks/use-assisted-bookings-chat';
import { BookingChatPanel } from './booking-chat-panel';
import { BookingStatusBadge } from './booking-status-badge';

const RESERVATION_DETAIL_ROUTE = /^\/account\/reservations\/[^/]+(\/chat)?$/;
const FAB_STORAGE_KEY = 'atg-web-booking-chat-fab-position';

function ReservationChatPicker({
  items,
  loading,
  localeTag,
  onSelect,
}: {
  items: AssistedBookingChatItem[];
  loading: boolean;
  localeTag: string;
  onSelect: (bookingId: string) => void;
}) {
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;

  if (loading) {
    return <p className="text-sm text-atg-muted">{m.pickerLoading}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-atg-muted">{m.pickerEmpty}</p>;
  }

  return (
    <ul className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-atg-surface dark:border-atg-border dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-atg-fg">
                {item.name || `${item.id.slice(0, 8)}…`}
              </p>
              <p className="mt-0.5 font-mono text-xs text-atg-muted">
                {item.id.slice(0, 8)}…
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {formatBookingMoney(item.totalCents, item.currency)}
              </p>
              <p className="mt-1 text-xs text-atg-muted">
                {formatBookingDateTime(item.createdAt, localeTag)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <BookingStatusBadge status={item.status} size="sm" />
                {item.actionRequired ? (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                    {t.account.reservations.actionRequired}
                  </span>
                ) : null}
              </div>
            </div>
            {item.unreadCount > 0 ? (
              <span
                className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white"
                aria-label={m.unreadBadge.replace('{count}', String(item.unreadCount))}
              >
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function GlobalBookingChatFab() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const localeTag = localeToBcp47(locale);
  const t = useTranslations();
  const m = t.account.reservations.detail.messages;
  const { items, totalUnread, loading, refresh } = useAssistedBookingsChat();

  const [open, setOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const selectedBooking = useMemo(
    () => items.find((item) => item.id === selectedBookingId) ?? null,
    [items, selectedBookingId],
  );

  const hideOnReservationDetail = RESERVATION_DETAIL_ROUTE.test(pathname);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        setSelectedBookingId(null);
        void refresh();
      }
    },
    [refresh],
  );

  const handleSelectBooking = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedBookingId(null);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (open && items.length === 1 && !selectedBookingId) {
      setSelectedBookingId(items[0].id);
    }
  }, [open, items, selectedBookingId]);

  if (hideOnReservationDetail || (!loading && items.length === 0)) {
    return null;
  }

  const fabAriaLabel =
    totalUnread > 0
      ? m.fabAriaLabelWithUnread.replace('{count}', String(totalUnread))
      : m.fabAriaLabel;

  const modalTitle = selectedBooking
    ? selectedBooking.name || m.title
    : m.pickerTitle;

  return (
    <>
      {!open ? (
        <DraggableFab
          onClick={() => setOpen(true)}
          ariaLabel={fabAriaLabel}
          storageKey={FAB_STORAGE_KEY}
          badgeCount={totalUnread}
        >
          <BookingChatFabIcon className="size-11" />
        </DraggableFab>
      ) : null}

      <Modal
        open={open}
        onOpenChange={handleOpenChange}
        title={modalTitle}
        showClose
        className="flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col"
      >
        {selectedBooking ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={handleBackToList}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ← {m.backToReservations}
                </button>
              ) : (
                <span />
              )}
              <Link
                href={`/account/reservations/${selectedBooking.id}`}
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                {m.viewBooking}
              </Link>
            </div>
            <BookingChatPanel
              key={selectedBooking.id}
              bookingId={selectedBooking.id}
              localeTag={localeTag}
              canReply={selectedBooking.canReply}
              initialUnreadCount={selectedBooking.unreadCount}
              trackUnread={false}
              className="flex min-h-0 flex-1 flex-col"
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <p className="mb-4 text-sm text-atg-muted">{m.pickerSubtitle}</p>
            <ReservationChatPicker
              items={items}
              loading={loading}
              localeTag={localeTag}
              onSelect={handleSelectBooking}
            />
          </div>
        )}
      </Modal>
    </>
  );
}
