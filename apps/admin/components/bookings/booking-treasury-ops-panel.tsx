'use client';

import {
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
  type DataTableBadgeVariant,
} from '@africatourismgate/ui';
import type { FundEntry, FundExit, FundExitStatus } from '@africatourismgate/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { resolveUnknownApiError } from '../../lib/common-api-errors';
import { formatMoney } from '../../lib/format-money';
import {
  useFundEntryStatusLabels,
  useFundExitStatusLabels,
} from '../../lib/i18n/use-module-labels';

const PAGE_SIZE = 50;

type LinkedOp =
  | { kind: 'entry'; row: FundEntry }
  | { kind: 'exit'; row: FundExit };

const EXIT_BADGE: Record<FundExitStatus, DataTableBadgeVariant> = {
  draft: 'muted',
  disbursed: 'default',
  recorded: 'success',
  voided: 'danger',
};

type BookingTreasuryOpsPanelProps = {
  bookingId: string;
};

export function BookingTreasuryOpsPanel({
  bookingId,
}: BookingTreasuryOpsPanelProps) {
  const t = useTranslations('modules.bookings.detail.treasuryOps');
  const tSections = useTranslations('modules.bookings.detail.sections');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tErrors = useTranslations('modules.treasury.errors');
  const tCommonErrors = useTranslations('common.errors');
  const entryStatusLabels = useFundEntryStatusLabels();
  const exitStatusLabels = useFundExitStatusLabels();
  const locale = useLocale();
  const emptyDash = '—';

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ops: LinkedOp[] }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const client = getApiClient();
      const [entries, exits] = await Promise.all([
        client.listFundEntries({ bookingId, page: 1, limit: PAGE_SIZE }),
        client.listFundExits({ bookingId, page: 1, limit: PAGE_SIZE }),
      ]);
      const ops: LinkedOp[] = [
        ...entries.data.map((row) => ({ kind: 'entry' as const, row })),
        ...exits.data.map((row) => ({ kind: 'exit' as const, row })),
      ].sort((a, b) => {
        const dateA = a.row.operationDate;
        const dateB = b.row.operationDate;
        if (dateA !== dateB) return dateB.localeCompare(dateA);
        return b.row.createdAt.localeCompare(a.row.createdAt);
      });
      setState({ status: 'ready', ops });
    } catch (error) {
      setState({
        status: 'error',
        message: resolveUnknownApiError(
          error,
          {
            network: tCommonErrors('network'),
            forbidden: tErrors('forbidden'),
            generic: tErrors('loadFailed'),
            apiStatus: (status: number) =>
              tCommonErrors('apiStatus', { status }),
          },
          { useParseApiMessage: true },
        ),
      });
    }
  }, [bookingId, tCommonErrors, tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = useCallback(
    (value: string) => {
      try {
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
          new Date(`${value.slice(0, 10)}T12:00:00`),
        );
      } catch {
        return value;
      }
    },
    [locale],
  );

  const columns = useMemo<ColumnDef<LinkedOp, unknown>[]>(
    () => [
      {
        id: 'kind',
        header: t('columns.kind'),
        cell: ({ row }) => (
          <DataTableBadge
            variant={row.original.kind === 'entry' ? 'success' : 'default'}
          >
            {row.original.kind === 'entry' ? t('kindEntry') : t('kindExit')}
          </DataTableBadge>
        ),
      },
      {
        id: 'date',
        header: t('columns.date'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDate(row.original.row.operationDate)}
          </span>
        ),
      },
      {
        id: 'amount',
        header: t('columns.amount'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium tabular-nums">
            {formatMoney(
              row.original.row.amountCents,
              row.original.row.currency,
            )}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('columns.status'),
        cell: ({ row }) => {
          if (row.original.kind === 'entry') {
            const status = row.original.row.status;
            return (
              <DataTableBadge
                variant={status === 'voided' ? 'danger' : 'success'}
              >
                {entryStatusLabels[status] ?? status}
              </DataTableBadge>
            );
          }
          const status = row.original.row.status;
          return (
            <DataTableBadge variant={EXIT_BADGE[status] ?? 'muted'}>
              {exitStatusLabels[status] ?? status}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'reference',
        header: t('columns.reference'),
        meta: { hideOnMobile: true },
        cell: ({ row }) =>
          row.original.row.reference?.trim() || emptyDash,
      },
      {
        id: 'link',
        header: t('columns.link'),
        enableSorting: false,
        cell: ({ row }) => {
          const id = row.original.row.id;
          const href =
            row.original.kind === 'entry'
              ? `/tresorerie/entrees/${id}/voir`
              : `/tresorerie/sorties/${id}/voir`;
          return (
            <Link
              href={href}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('openDetail')}
            </Link>
          );
        },
      },
    ],
    [t, formatDate, entryStatusLabels, exitStatusLabels],
  );

  return (
    <section className="min-w-0 space-y-3 overflow-x-hidden">
      <h2 className="text-lg font-semibold text-atg-fg">
        {tSections('treasury')}
      </h2>

      {state.status === 'loading' ? (
        <Skeleton className="h-28 w-full rounded-xl" />
      ) : state.status === 'error' ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
          <DataTable
            columns={columns}
            data={state.ops}
            emptyMessage={t('empty')}
            expandRowLabel={tDataTable('expandRow')}
            collapseRowLabel={tDataTable('collapseRow')}
            expandRowAriaLabel={tDataTable('expandRowAria')}
            getRowId={(row) => `${row.kind}-${row.row.id}`}
            aria-label={t('ariaLabel')}
            className="min-w-0"
          />
        </Card>
      )}
    </section>
  );
}
