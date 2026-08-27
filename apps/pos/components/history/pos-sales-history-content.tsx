'use client';

import type { BookingListItem, BookingStatus } from '@africatourismgate/types';
import { Button, cn } from '@africatourismgate/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getHistoryPaymentLabel,
  getHistoryStatusLabel,
  posHistoryPageConfig,
} from '../../config/history';
import { AUTH_CHANGED_EVENT, getSession, type PosStoredSession } from '../../lib/auth/session';
import {
  buildHistoryDetailUrl,
  fetchTodaySales,
  formatBookingShortId,
  formatClientName,
  getLocalTodayIsoDate,
  historyErrorMessage,
} from '../../lib/history/daily-sales';
import { formatDisplayDate, formatDisplayDateTime } from '../../lib/sale/dates';
import { formatCents } from '../../lib/sale/format';
import { SalesHistorySkeleton } from './sales-history-skeleton';

const labels = posHistoryPageConfig;

function statusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500/15 text-green-700 dark:text-green-400';
    case 'pending_payment':
    case 'pending_approval':
      return 'bg-amber-500/15 text-amber-800 dark:text-amber-300';
    case 'cancelled':
    case 'refunded':
      return 'bg-atg-surface text-atg-muted';
    default:
      return 'bg-primary/10 text-primary';
  }
}

function HistorySaleCard({ item }: { item: BookingListItem }) {
  const router = useRouter();
  const href = buildHistoryDetailUrl(item.id, item.preferredPaymentMethod);

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={cn(
        'flex w-full flex-col rounded-xl border border-atg-border bg-atg-surface/40 p-4 text-left',
        'transition-all duration-200 hover:border-primary/35 hover:bg-primary/[0.04]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'min-h-[5.5rem]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
            {labels.bookingLabel} · {formatBookingShortId(item.id)}
          </p>
          <p className="mt-1 text-sm text-atg-muted">
            {formatDisplayDateTime(item.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
            statusBadgeClass(item.status),
          )}
        >
          {getHistoryStatusLabel(item.status)}
        </span>
      </div>

      <p className="mt-3 text-base font-semibold text-atg-fg">{formatClientName(item)}</p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-atg-border/70 pt-3">
        <span className="text-sm text-atg-muted">
          {getHistoryPaymentLabel(item.preferredPaymentMethod)}
        </span>
        <span className="text-lg font-bold text-primary">
          {formatCents(item.totalCents, item.currency)}
        </span>
      </div>

      {item.status === 'confirmed' ? (
        <p className="mt-2 text-xs text-atg-muted">{labels.openDetailHint}</p>
      ) : null}
    </button>
  );
}

export function PosSalesHistoryContent() {
  const [session, setSession] = useState<PosStoredSession | null>(null);
  const [sales, setSales] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodaySales(userId);
      setSales(data);
    } catch (err: unknown) {
      setSales([]);
      setError(historyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const syncSession = () => setSession(getSession());
    syncSession();
    window.addEventListener(AUTH_CHANGED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      setLoading(false);
      return;
    }
    void load(userId);
  }, [session?.user.id, load]);

  const todayLabel = formatDisplayDate(getLocalTodayIsoDate());

  return (
    <div className="space-y-6">
      <header className="border-b border-atg-border/60 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-atg-fg md:text-3xl">
              {labels.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-atg-muted md:text-base">
              {labels.subtitle}
            </p>
            {session?.selectedOrganizationName ? (
              <p className="mt-1 text-sm text-atg-muted">
                {session.selectedOrganizationName}
                {todayLabel ? ` · ${todayLabel}` : null}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            className="min-h-[2.75rem] shrink-0"
            disabled={loading || !session?.user.id}
            onClick={() => {
              if (session?.user.id) {
                void load(session.user.id);
              }
            }}
          >
            {labels.refreshLabel}
          </Button>
        </div>
      </header>

      {!session?.user.id && !loading ? (
        <p role="alert" className="text-sm text-red-600">
          {labels.errorHint}
        </p>
      ) : null}

      {loading ? (
        <div aria-busy="true" aria-live="polite">
          <p className="mb-4 text-sm text-atg-muted">{labels.loadingLabel}</p>
          <SalesHistorySkeleton />
        </div>
      ) : null}

      {!loading && error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          <p className="font-semibold">{error}</p>
          <p className="mt-1 text-red-700/90 dark:text-red-300/80">{labels.errorHint}</p>
        </div>
      ) : null}

      {!loading && !error && sales.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-atg-border bg-atg-surface/30 px-6 py-14 text-center">
          <p className="text-lg font-semibold text-atg-fg">{labels.emptyTitle}</p>
          <p className="mt-2 max-w-sm text-sm text-atg-muted">{labels.emptyHint}</p>
          <Button variant="primary" size="lg" href="/sale" className="mt-6 min-h-[3rem]">
            Nouvelle vente
          </Button>
        </div>
      ) : null}

      {!loading && !error && sales.length > 0 ? (
        <div>
          <p className="mb-4 text-sm font-medium text-atg-muted">
            {labels.saleCount(sales.length)}
          </p>
          <ul className="space-y-3">
            {sales.map((item) => (
              <li key={item.id}>
                <HistorySaleCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button variant="outline" size="lg" href="/" fullWidth className="min-h-[3rem]">
        {labels.backToHomeLabel}
      </Button>
    </div>
  );
}
