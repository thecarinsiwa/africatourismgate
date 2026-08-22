'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableBadge,
  Skeleton,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { BookingGuideAssignmentHistoryItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useBookingGuideRoleLabels, useFormatDateTime } from '../../lib/i18n/use-module-labels';

type BookingGuideAssignmentHistorySectionProps = {
  bookingId: string;
  embedded?: boolean;
};

export function BookingGuideAssignmentHistorySection({
  bookingId,
  embedded = false,
}: BookingGuideAssignmentHistorySectionProps) {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.guides.history');
  const roleLabels = useBookingGuideRoleLabels();
  const formatDateTime = useFormatDateTime();

  const [rows, setRows] = useState<BookingGuideAssignmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApiClient().listBookingGuideAssignmentHistory(bookingId);
      setRows(data);
    } catch (err) {
      setError(getBookingsErrorMessage(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [bookingId, getBookingsErrorMessage]);

  useEffect(() => {
    if (expanded) {
      void load();
    }
  }, [expanded, load]);

  const columns = useMemo<ColumnDef<BookingGuideAssignmentHistoryItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('columns.when'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{formatDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        id: 'action',
        header: t('columns.action'),
        cell: ({ row }) => (
          <DataTableBadge variant="muted">{t(`actions.${row.original.action}`)}</DataTableBadge>
        ),
      },
      {
        id: 'guide',
        header: t('columns.guide'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {row.original.guideDisplayName ?? row.original.guideId.slice(0, 8)}
          </span>
        ),
      },
      {
        id: 'schedule',
        header: t('columns.schedule'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {formatDateTime(row.original.snapshot.startDatetime)} –{' '}
            {formatDateTime(row.original.snapshot.endDatetime)}
          </span>
        ),
      },
      {
        accessorKey: 'snapshot.role',
        header: t('columns.role'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{roleLabels[row.original.snapshot.role]}</span>
        ),
      },
      {
        id: 'actor',
        header: t('columns.actor'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.actorDisplayName ?? '—'}</span>
        ),
      },
    ],
    [formatDateTime, roleLabels, t],
  );

  return (
    <Card variant="dashboard" padding="md" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-atg-fg">
            {embedded ? t('titleShort') : t('title')}
          </h3>
          <p className="text-xs text-atg-muted">{t('description')}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? t('collapse') : t('expand')}
        </Button>
      </div>

      {expanded ? (
        <>
          {error ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          ) : null}
          <DataTable
            columns={columns}
            data={rows}
            isLoading={loading}
            emptyMessage={t('empty')}
            getRowId={(row) => row.id}
            aria-label={t('ariaLabel')}
          />
        </>
      ) : null}
    </Card>
  );
}
