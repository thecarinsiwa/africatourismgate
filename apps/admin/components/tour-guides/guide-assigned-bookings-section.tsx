'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { TourGuideBookingListItem } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  BOOKING_STATUS_VARIANTS,
  getBookingStatusLabel,
} from '../../lib/booking-status';
import { formatMoney } from '../../lib/format-money';
import {
  useBookingGuideRoleLabels,
  useBookingStatusLabels,
  useFormatDateTime,
} from '../../lib/i18n/use-module-labels';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 10;

type GuideAssignedBookingsSectionProps = {
  guideId: string;
};

export function GuideAssignedBookingsSection({ guideId }: GuideAssignedBookingsSectionProps) {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.sections.bookings');
  const tCommon = useTranslations('modules.common');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tColumns = useTranslations('modules.common.columns');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tActions = useTranslations('common.actions');
  const statusLabels = useBookingStatusLabels();
  const roleLabels = useBookingGuideRoleLabels();
  const formatDateTime = useFormatDateTime('short');
  const paginationLabels = useDataTablePaginationLabels();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        rows: TourGuideBookingListItem[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listTourGuideBookings(guideId, {
        page,
        limit: PAGE_SIZE,
        sortOrder: 'desc',
        search: search || undefined,
      });
      setState({
        status: 'ready',
        rows: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [getTourGuidesErrorMessage, guideId, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<ColumnDef<TourGuideBookingListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: tColumns('date'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'client',
        header: tColumns('client'),
        cell: ({ row }) => (
          <div className="min-w-0">
            <span className="block truncate font-medium text-atg-fg">{row.original.clientEmail}</span>
            <p className="truncate text-xs text-atg-muted">
              {row.original.clientFirstName} {row.original.clientLastName}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={BOOKING_STATUS_VARIANTS[row.original.status]}>
            {getBookingStatusLabel(row.original.status, statusLabels)}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'role',
        header: t('role'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{roleLabels[row.original.role]}</span>
        ),
      },
      {
        accessorKey: 'assignedAt',
        header: t('assignedAt'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {formatDateTime(row.original.assignedAt)}
          </span>
        ),
      },
      {
        id: 'total',
        header: tColumns('amount'),
        meta: { align: 'right', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.totalCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              label={tActions('view')}
              href={`/reservations/${row.original.bookingId}`}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      formatDateTime,
      roleLabels,
      statusLabels,
      t,
      tActions,
      tColumns,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const rows = state.status === 'ready' ? state.rows : [];
  const hasSearch = search.trim().length > 0;

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-atg-fg">{t('title')}</h3>
        <p className="mt-0.5 text-xs text-atg-muted">{t('intro')}</p>
      </div>

      {isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          <div className="max-w-md">
            <Input
              name="missionsSearch"
              type="search"
              placeholder={tCommonFilters('searchBookings')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={tCommonFilters('searchBookingsAria')}
            />
          </div>

          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={isLoading}
              loadingMessage={tDataTable('loading')}
              emptyMessage={hasSearch ? t('emptySearch') : t('empty')}
              emptyVariant={hasSearch ? 'search' : 'default'}
              getRowId={(row) => row.assignmentId}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.booking')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
