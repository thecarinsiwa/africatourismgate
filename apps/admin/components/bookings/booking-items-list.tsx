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
import type {
  BookingItemListItem,
  BookingItemType,
  BookingStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  BOOKING_STATUS_VARIANTS,
  getBookingStatusLabel,
} from '../../lib/booking-status';
import { formatMoney } from '../../lib/format-money';
import {
  useBookingItemTypeOptions,
  useBookingStatusFilterOptions,
  useBookingStatusLabels,
} from '../../lib/i18n/use-module-labels';
import { BookingItemCatalogLink } from './booking-item-catalog-link';
import { BookingItemTypeIcon } from './booking-item-type-icon';

const PAGE_SIZE = 10;

type StatusFilter = '' | BookingStatus;
type ItemTypeFilter = '' | BookingItemType;

function formatDates(startDate: string | null, endDate: string | null, emptyDash: string): string {
  if (!startDate) return emptyDash;
  if (startDate === endDate || !endDate) return startDate;
  return `${startDate} → ${endDate}`;
}

function formatBookingRef(bookingId: string): string {
  return bookingId.slice(0, 8);
}

export function BookingItemsList() {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.itemsList');
  const tCommon = useTranslations('modules.common');
  const statusLabels = useBookingStatusLabels();
  const statusFilterOptions = useBookingStatusFilterOptions();
  const itemTypeOptions = useBookingItemTypeOptions();
  const emptyDash = tCommon('empty.dash');

  const itemTypeFilterId = useId();
  const statusFilterId = useId();
  const bookingIdFilterId = useId();

  const [page, setPage] = useState(1);
  const [filterTick, setFilterTick] = useState(0);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [bookingIdFilter, setBookingIdFilter] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; items: BookingItemListItem[]; total: number; totalPages: number }
  >({ status: 'loading' });

  const load = useCallback(async () => {
    void filterTick;
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listBookingItems({
        page,
        limit: PAGE_SIZE,
        itemType: itemTypeFilter || undefined,
        status: statusFilter || undefined,
        bookingId: bookingIdFilter.trim() || undefined,
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getBookingsErrorMessage(error) });
    }
  }, [page, itemTypeFilter, statusFilter, bookingIdFilter, filterTick, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((tick) => tick + 1);
  }, []);

  const columns = useMemo<ColumnDef<BookingItemListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemType',
        header: tCommon('columns.type'),
        cell: ({ row }) => (
          <BookingItemTypeIcon itemType={row.original.itemType} size="sm" showLabel />
        ),
      },
      {
        accessorKey: 'titleSnapshot',
        header: tCommon('columns.label'),
        cell: ({ row }) => (
          <BookingItemCatalogLink
            itemType={row.original.itemType}
            referenceId={row.original.referenceId}
            title={row.original.titleSnapshot}
            showReference
          />
        ),
      },
      {
        id: 'dates',
        header: tCommon('columns.dates'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDates(row.original.startDate, row.original.endDate, emptyDash)}
          </span>
        ),
      },
      {
        id: 'amount',
        header: tCommon('columns.amount'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.lineTotalCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'bookingRef',
        header: tCommon('columns.booking'),
        cell: ({ row }) => (
          <Link
            href={`/dashboard/bookings/${row.original.bookingId}`}
            className="font-mono text-xs text-primary hover:underline"
          >
            {formatBookingRef(row.original.bookingId)}
          </Link>
        ),
      },
      {
        id: 'bookingStatus',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.bookingStatus;
          return (
            <DataTableBadge variant={BOOKING_STATUS_VARIANTS[status]}>
              {getBookingStatusLabel(status, statusLabels)}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              href={`/dashboard/bookings/${row.original.bookingId}`}
            />
          </DataTableActions>
        ),
      },
    ],
    [emptyDash, statusLabels, tCommon],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const items = state.status === 'ready' ? state.items : [];
  const hasFilters =
    itemTypeFilter !== '' || statusFilter !== '' || bookingIdFilter.trim() !== '';
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label
              htmlFor={itemTypeFilterId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
              {t('filters.type')}
            </label>
            <select
              id={itemTypeFilterId}
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value as ItemTypeFilter)}
              className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">{tCommon('filters.all')}</option>
              {itemTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              {t('filters.bookingStatus')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full min-w-[200px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">{tCommon('filters.all')}</option>
              {statusFilterOptions
                .filter((option) => option.value !== '')
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={bookingIdFilterId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
              {t('filters.bookingId')}
            </label>
            <Input
              id={bookingIdFilterId}
              type="text"
              value={bookingIdFilter}
              onChange={(e) => setBookingIdFilter(e.target.value)}
              placeholder={t('filters.bookingIdPlaceholder')}
              className="min-w-[280px] font-mono text-sm"
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {tCommon('filters.apply')}
          </button>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={items}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={hasFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.line')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
