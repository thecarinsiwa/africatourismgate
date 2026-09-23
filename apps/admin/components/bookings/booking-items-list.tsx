'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type {
  BookingItemListItem,
  BookingItemType,
  BookingStatus,
} from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
const BOOKING_ID_DEBOUNCE_MS = 300;
/** UUID v4 — only send bookingId to the API once the value is complete. */
const BOOKING_ID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isBookingIdUuid(value: string): boolean {
  return BOOKING_ID_UUID_RE.test(value);
}

export function BookingItemsList() {
  const { bookings: getBookingsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.bookings.itemsList');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const statusLabels = useBookingStatusLabels();
  const statusFilterOptions = useBookingStatusFilterOptions();
  const itemTypeOptions = useBookingItemTypeOptions();
  const emptyDash = tCommon('empty.dash');

  const itemTypeSelectOptions = useMemo(
    () => [{ value: '', label: tCommon('filters.all') }, ...itemTypeOptions],
    [itemTypeOptions, tCommon],
  );

  const [page, setPage] = useState(1);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [bookingIdFilter, setBookingIdFilter] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; items: BookingItemListItem[]; total: number; totalPages: number }
  >({ status: 'loading' });

  useEffect(() => {
    const query = bookingIdInput.trim();
    const timer = window.setTimeout(() => {
      // Ignore partial IDs while typing — API requires a full UUID.
      const next = query === '' || isBookingIdUuid(query) ? query : null;
      if (next === null) return;
      setBookingIdFilter((prev) => (prev === next ? prev : next));
    }, BOOKING_ID_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [bookingIdInput]);

  useEffect(() => {
    setPage(1);
  }, [bookingIdFilter, itemTypeFilter, statusFilter]);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listBookingItems({
        page,
        limit: PAGE_SIZE,
        itemType: itemTypeFilter || undefined,
        status: statusFilter || undefined,
        bookingId: bookingIdFilter || undefined,
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
  }, [page, itemTypeFilter, statusFilter, bookingIdFilter, getBookingsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeFilterCount = [
    itemTypeFilter !== '',
    statusFilter !== '',
    bookingIdFilter !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;

  const handleClearFilters = useCallback(() => {
    setItemTypeFilter('');
    setStatusFilter('');
    setBookingIdInput('');
    setBookingIdFilter('');
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
        cell: ({ row }) => {
          const item = row.original;
          const lineTotal =
            typeof item.lineTotalCents === 'number' && Number.isFinite(item.lineTotalCents)
              ? item.lineTotalCents
              : Number(item.quantity ?? 0) * Number(item.unitPriceCents ?? 0);
          return (
            <span className="tabular-nums text-sm font-medium">
              {formatMoney(lineTotal, item.currency)}
            </span>
          );
        },
      },
      {
        id: 'bookingRef',
        header: tCommon('columns.booking'),
        cell: ({ row }) => (
          <Link
            href={`/reservations/${row.original.bookingId}`}
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
          const variant = status ? BOOKING_STATUS_VARIANTS[status] : 'muted';
          return (
            <DataTableBadge variant={variant ?? 'muted'}>
              {status ? getBookingStatusLabel(status, statusLabels) : emptyDash}
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
              href={`/reservations/${row.original.bookingId}`}
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
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="w-full sm:w-48">
              <Select
                label={t('filters.type')}
                value={itemTypeFilter}
                options={itemTypeSelectOptions}
                onChange={(e) => {
                  setItemTypeFilter(e.target.value as ItemTypeFilter);
                }}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                label={t('filters.bookingStatus')}
                value={statusFilter}
                options={statusFilterOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                }}
              />
            </div>
            <div className="w-full sm:min-w-[280px] sm:max-w-md sm:flex-1">
              <Input
                label={t('filters.bookingId')}
                name="bookingId"
                type="search"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                placeholder={t('filters.bookingIdPlaceholder')}
                className="font-mono text-sm"
              />
            </div>
          </>
        }
      />

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
              loadingMessage={tDataTable('loading')}
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
