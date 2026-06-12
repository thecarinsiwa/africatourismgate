'use client';

import {
  Button,
  Card,
  DataTable,
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
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { itemTypeLabels, itemTypeOptions } from '../../lib/booking-item-labels';
import { getBookingsErrorMessage } from '../../lib/bookings-errors';
import { formatMoney } from '../../lib/format-money';

const PAGE_SIZE = 20;

type StatusFilter = '' | BookingStatus;
type ItemTypeFilter = '' | BookingItemType;

const statusLabels: Record<BookingStatus, string> = {
  draft: 'Brouillon',
  pending_payment: 'En attente de paiement',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

const statusVariants: Record<
  BookingStatus,
  'success' | 'warning' | 'muted' | 'danger' | 'default'
> = {
  draft: 'muted',
  pending_payment: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  refunded: 'default',
};

function formatDates(startDate: string | null, endDate: string | null): string {
  if (!startDate) return '—';
  if (startDate === endDate || !endDate) return startDate;
  return `${startDate} → ${endDate}`;
}

function formatBookingRef(bookingId: string): string {
  return bookingId.slice(0, 8);
}

export function BookingItemsList() {
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
  }, [page, itemTypeFilter, statusFilter, bookingIdFilter, filterTick]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setFilterTick((t) => t + 1);
  }, []);

  const columns = useMemo<ColumnDef<BookingItemListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'itemType',
        header: 'Type',
        cell: ({ row }) => (
          <DataTableBadge variant="default">
            {itemTypeLabels[row.original.itemType] ?? row.original.itemType}
          </DataTableBadge>
        ),
      },
      {
        accessorKey: 'titleSnapshot',
        header: 'Libellé',
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-atg-fg">{row.original.titleSnapshot}</span>
            <p className="text-xs text-atg-muted">
              Réf. {row.original.referenceId.slice(0, 8)}
            </p>
          </div>
        ),
      },
      {
        id: 'dates',
        header: 'Dates',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-atg-muted">
            {formatDates(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        id: 'amount',
        header: 'Montant',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatMoney(row.original.lineTotalCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'bookingRef',
        header: 'Réservation',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-atg-muted">
            {formatBookingRef(row.original.bookingId)}
          </span>
        ),
      },
      {
        id: 'bookingStatus',
        header: 'Statut',
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.bookingStatus;
          return (
            <DataTableBadge variant={statusVariants[status]}>
              {statusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => (
          <Button
            href={`/dashboard/bookings/${row.original.bookingId}`}
            variant="ghost"
            size="sm"
          >
            Voir
          </Button>
        ),
      },
    ],
    [],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const items = state.status === 'ready' ? state.items : [];
  const hasFilters =
    itemTypeFilter !== '' || statusFilter !== '' || bookingIdFilter.trim() !== '';
  const emptyMessage = hasFilters
    ? 'Aucune ligne ne correspond à vos critères.'
    : 'Aucune ligne de réservation pour le moment.';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div>
            <label
              htmlFor={itemTypeFilterId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
              Type
            </label>
            <select
              id={itemTypeFilterId}
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value as ItemTypeFilter)}
              className="w-full min-w-[180px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Tous</option>
              {itemTypeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={statusFilterId} className="mb-2 block text-sm font-medium text-atg-fg">
              Statut réservation
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full min-w-[200px] rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Tous</option>
              {(Object.keys(statusLabels) as BookingStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor={bookingIdFilterId}
              className="mb-2 block text-sm font-medium text-atg-fg"
            >
              ID réservation
            </label>
            <Input
              id={bookingIdFilterId}
              type="text"
              value={bookingIdFilter}
              onChange={(e) => setBookingIdFilter(e.target.value)}
              placeholder="UUID complet"
              className="min-w-[280px] font-mono text-sm"
            />
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Appliquer
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
              aria-label="Lignes de réservation"
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="ligne"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
