'use client';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { FlightClassAvailability } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { formatDateLabel, formatPrice } from '../../lib/availability-dates';

type FlightClassAvailabilityTableProps = {
  rows: FlightClassAvailability[];
  isLoading?: boolean;
  onEditDate?: (date: string) => void;
  onDelete?: (row: FlightClassAvailability) => void;
  deletingId?: string | null;
};

export function FlightClassAvailabilityTable({
  rows,
  isLoading = false,
  onEditDate,
  onDelete,
  deletingId,
}: FlightClassAvailabilityTableProps) {
  const t = useTranslations('modules.flights.sections.availability');
  const tColumns = useTranslations('modules.common.columns');
  const tCalendar = useTranslations('modules.common.availabilityCalendar');
  const tCommon = useTranslations('modules.common');

  const columns = useMemo<ColumnDef<FlightClassAvailability, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: tColumns('date'),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium text-atg-fg">
            {formatDateLabel(row.original.date.slice(0, 10))}
          </span>
        ),
      },
      {
        id: 'availableSeats',
        header: tCalendar('availableSeats'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-md bg-atg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-atg-fg">
            {row.original.availableSeats}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('price'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <div className="text-right">
            <p className="tabular-nums text-sm font-semibold text-atg-fg">
              {formatPrice(row.original.priceCents, 'USD')}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-atg-muted">
              USD
            </p>
          </div>
        ),
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
            {onEditDate ? (
              <DataTableActionButton
                action="edit"
                onClick={() => onEditDate(row.original.date.slice(0, 10))}
              />
            ) : null}
            {onDelete ? (
              <DataTableActionButton
                action="delete"
                onClick={() => onDelete(row.original)}
                disabled={deletingId === row.original.id}
                loading={deletingId === row.original.id}
              />
            ) : null}
          </DataTableActions>
        ),
      },
    ],
    [deletingId, onDelete, onEditDate, tCalendar, tColumns],
  );

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-atg-fg">{t('tableTitle')}</h3>
        <p className="mt-1 text-sm text-atg-muted">{t('tableIntro')}</p>
      </div>
      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          emptyMessage={t('tableEmpty')}
          getRowId={(row) => row.id}
          aria-label={t('tableTitle')}
          loadingMessage={tCommon('dataTable.loading')}
          expandRowLabel={tCommon('dataTable.expandRow')}
          collapseRowLabel={tCommon('dataTable.collapseRow')}
          expandRowAriaLabel={tCommon('dataTable.expandRowAria')}
        />
      </Card>
    </section>
  );
}
