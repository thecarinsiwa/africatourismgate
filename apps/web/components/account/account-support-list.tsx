'use client';

import type { SupportTicket, SupportTicketStatus } from '@africatourismgate/types';
import { DataTableBadge, Skeleton } from '@africatourismgate/ui';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { getAccountApiClient } from '../../lib/api/account';
import { formatBookingDateTime } from '../../lib/bookings/display';
import { localeToBcp47 } from '../../lib/i18n/locale-tag';
import type { Locale } from '../../lib/i18n/types';

const STATUS_VARIANT: Record<
  SupportTicketStatus,
  'success' | 'warning' | 'muted' | 'danger'
> = {
  open: 'warning',
  pending: 'muted',
  resolved: 'success',
  closed: 'muted',
};

export function AccountSupportList() {
  const t = useTranslations('account.support');
  const locale = useLocale();
  const localeTag = localeToBcp47(locale as Locale);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client = await getAccountApiClient();
      const result = await client.listSupportTickets({
        page: 1,
        limit: 50,
      });
      setTickets(result.data);
    } catch {
      setError(t('loadError'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="space-y-4 text-center sm:text-left">
        <p className="text-sm text-atg-muted">{t('empty')}</p>
        <p className="text-sm text-atg-muted">{t('emptyHint')}</p>
        <Link
          href="/support#support-form"
          className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-[var(--atg-primary-hover)]"
        >
          {t('newTicket')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-atg-muted">{t('listSubtitle')}</p>
        <Link
          href="/support#support-form"
          className="text-sm font-medium text-primary hover:underline"
        >
          {t('newTicket')}
        </Link>
      </div>
      <ul className="divide-y divide-atg-border rounded-lg border border-atg-border dark:divide-atg-border dark:border-atg-border">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              href={`/account/support/${ticket.id}`}
              className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-atg-surface sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-atg-fg dark:text-white">
                  {ticket.subject}
                </p>
                <p className="mt-0.5 text-xs text-atg-muted">
                  {formatBookingDateTime(ticket.createdAt, localeTag)}
                </p>
              </div>
              <DataTableBadge variant={STATUS_VARIANT[ticket.status]}>
                {t(`status.${ticket.status}`)}
              </DataTableBadge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
