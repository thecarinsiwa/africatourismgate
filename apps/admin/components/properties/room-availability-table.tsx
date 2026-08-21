'use client';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { RoomAvailability } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { formatDateLabel, formatPrice } from '../../lib/availability-dates';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';

const PAGE_SIZE = 2;

type RoomAvailabilityTableProps = {
  rows: RoomAvailability[];
  currency: string;
  isLoading?: boolean;
  onEditDate?: (date: string) => void;
  onDelete?: (row: RoomAvailability) => void;
  deletingId?: string | null;
};

export function RoomAvailabilityTable({
  rows,
  currency,
  isLoading = false,
  onEditDate,
  onDelete,
  deletingId,
}: RoomAvailabilityTableProps) {
  const t = useTranslations('modules.properties.sections.availability');
  const tColumns = useTranslations('modules.common.columns');
  const tCalendar = useTranslations('modules.common.availabilityCalendar');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const paginationLabels = useDataTablePaginationLabels();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const listKey = `${rows.length}:${rows[0]?.date?.slice(0, 7) ?? ''}`;

  useEffect(() => {
    setPage(1);
  }, [listKey]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [page, rows]);

  const columns = useMemo<ColumnDef<RoomAvailability, unknown>[]>(
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
        id: 'availableUnits',
        header: tCalendar('stockUnits'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center rounded-md bg-atg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-atg-fg">
            {row.original.availableUnits}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('price'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-semibold text-atg-fg">
            {formatPrice(row.original.priceCents, currency)}
          </span>
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
    [currency, deletingId, onDelete, onEditDate, tCalendar, tColumns],
  );

  return (
    <section className="min-w-0 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-atg-fg">{t('tableTitle')}</h3>
        <p className="mt-0.5 text-xs text-atg-muted">{t('tableIntro')}</p>
      </div>
      <Card variant="dashboard" padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={pageRows}
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
      {!isLoading && rows.length > 0 ? (
        <DataTablePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          totalItems={rows.length}
          itemLabel={tPagination('date')}
          onPageChange={setPage}
          labels={paginationLabels}
        />
      ) : null}
    </section>
  );
}
