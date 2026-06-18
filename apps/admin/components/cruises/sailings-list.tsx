'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { SailingsCalendarView } from './sailings-calendar-view';

const PAGE_SIZE = 20;

type ViewMode = 'list' | 'calendar';

export function SailingsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.cruises.list');
  const tColumns = useTranslations('modules.cruises.columns');
  const tCommon = useTranslations('modules.common');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        sailings: CruiseSailing[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formatDate = useCallback(
    (iso: string): string => {
      try {
        return new Date(iso).toLocaleDateString(locale, { dateStyle: 'medium' });
      } catch {
        return iso;
      }
    },
    [locale],
  );

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listItineraries({ page: 1, limit: 100 }),
      client.listShips({ page: 1, limit: 100 }),
    ])
      .then(([i, s]) => {
        setItineraries(i.data);
        setShips(s.data);
      })
      .catch(() => {
        setItineraries([]);
        setShips([]);
      });
  }, []);

  const itineraryById = useMemo(
    () => new Map(itineraries.map((i) => [i.id, i])),
    [itineraries],
  );
  const shipById = useMemo(() => new Map(ships.map((s) => [s.id, s])), [ships]);
  const emptyDash = tCommon('empty.dash');

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruiseSailings({
        page,
        limit: PAGE_SIZE,
      });
      setState({
        status: 'ready',
        sailings: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [page, getCroisieresErrorMessage]);

  useEffect(() => {
    if (viewMode === 'list') {
      void load();
    }
  }, [load, viewMode]);

  const handleDelete = useCallback(
    async (sailing: CruiseSailing) => {
      const itinerary = itineraryById.get(sailing.itineraryId);
      const label = itinerary
        ? `${itinerary.name} — ${formatDate(sailing.departureDate)}`
        : formatDate(sailing.departureDate);
      if (!window.confirm(t('deleteSailingConfirm', { label }))) return;
      setDeleteError(null);
      setDeletingId(sailing.id);
      try {
        await getApiClient().deleteCruiseSailing(sailing.id);
        await load();
      } catch (error) {
        setDeleteError(getCroisieresErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [formatDate, itineraryById, load, t, getCroisieresErrorMessage],
  );

  const columns = useMemo<ColumnDef<CruiseSailing, unknown>[]>(
    () => [
      {
        id: 'departure',
        header: tColumns('departure'),
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-medium">
            {formatDate(row.original.departureDate)}
          </span>
        ),
      },
      {
        id: 'itinerary',
        header: tColumns('itinerary'),
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          return it?.name ?? emptyDash;
        },
      },
      {
        id: 'ship',
        header: tColumns('ship'),
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          const ship = it ? shipById.get(it.shipId) : undefined;
          return ship?.name ?? emptyDash;
        },
      },
      {
        id: 'nights',
        header: tColumns('nights'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const it = itineraryById.get(row.original.itineraryId);
          return it?.durationNights ?? emptyDash;
        },
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              href={`/produits/croisieres/${row.original.id}`}
            />
            <DataTableActionButton
              action="delete"
              onClick={() => void handleDelete(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [
      deletingId,
      emptyDash,
      formatDate,
      handleDelete,
      itineraryById,
      shipById,
      tColumns,
      tCommon,
    ],
  );

  const sailings = state.status === 'ready' ? state.sailings : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            {t('viewList')}
          </Button>
          <Button
            type="button"
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            {t('viewCalendar')}
          </Button>
        </div>
        <Button href="/produits/croisieres/nouveau">{t('newSailing')}</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600">
          {deleteError}
        </p>
      ) : null}

      {viewMode === 'calendar' ? (
        <SailingsCalendarView itineraryById={itineraryById} shipById={shipById} />
      ) : state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={sailings}
              isLoading={state.status === 'loading'}
              emptyMessage={t('emptySailings')}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.sailing')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
