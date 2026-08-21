'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruiseSailing, Itinerary, Ship } from '@africatourismgate/types';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { SailingsCalendarView } from './sailings-calendar-view';
import { ShipThumbnail } from './ship-thumbnail';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type ViewMode = 'grid' | 'table' | 'calendar';

export function SailingsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const locale = useLocale();
  const t = useTranslations('modules.cruises.list');
  const tColumns = useTranslations('modules.cruises.columns');
  const tFilters = useTranslations('modules.cruises.filters');
  const tCommon = useTranslations('modules.common');
  const tDataTable = useTranslations('modules.common.dataTable');
  const paginationLabels = useDataTablePaginationLabels();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [shipFilter, setShipFilter] = useState('');
  const [itineraryFilter, setItineraryFilter] = useState('');
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
  const [confirmTarget, setConfirmTarget] = useState<CruiseSailing | null>(null);

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

  useEffect(() => {
    const q = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const itineraryById = useMemo(
    () => new Map(itineraries.map((i) => [i.id, i])),
    [itineraries],
  );
  const shipById = useMemo(() => new Map(ships.map((s) => [s.id, s])), [ships]);
  const emptyDash = tCommon('empty.dash');

  const filteredItineraries = useMemo(() => {
    if (!shipFilter) return itineraries;
    return itineraries.filter((it) => it.shipId === shipFilter);
  }, [itineraries, shipFilter]);

  const shipOptions = useMemo(
    () => [
      { value: '', label: tFilters('allShips') },
      ...ships.map((s) => ({ value: s.id, label: s.name })),
    ],
    [ships, tFilters],
  );

  const itineraryOptions = useMemo(
    () => [
      { value: '', label: tFilters('allItineraries') },
      ...filteredItineraries.map((it) => {
        const ship = shipById.get(it.shipId);
        return {
          value: it.id,
          label: ship ? `${it.name} — ${ship.name}` : it.name,
        };
      }),
    ],
    [filteredItineraries, shipById, tFilters],
  );

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
      { value: 'calendar' as const, label: t('viewCalendar') },
    ],
    [t],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruiseSailings({
        page,
        limit: PAGE_SIZE,
        itineraryId: itineraryFilter || undefined,
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
  }, [page, itineraryFilter, getCroisieresErrorMessage]);

  useEffect(() => {
    if (viewMode === 'calendar') return;
    void load();
  }, [load, viewMode]);

  const handleDeleteRequest = useCallback((sailing: CruiseSailing) => {
    setConfirmTarget(sailing);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const sailing = confirmTarget;
    setConfirmTarget(null);
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
  }, [confirmTarget, getCroisieresErrorMessage, load]);

  const confirmLabel = useMemo(() => {
    if (!confirmTarget) return '';
    const itinerary = itineraryById.get(confirmTarget.itineraryId);
    return itinerary
      ? `${itinerary.name} — ${formatDate(confirmTarget.departureDate)}`
      : formatDate(confirmTarget.departureDate);
  }, [confirmTarget, formatDate, itineraryById]);

  const renderSailingActions = useCallback(
    (sailing: CruiseSailing) => (
      <DataTableActions>
        <DataTableActionButton
          action="edit"
          href={`/produits/croisieres/${sailing.id}`}
        />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(sailing)}
          disabled={deletingId === sailing.id}
          loading={deletingId === sailing.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
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
        cell: ({ row }) => renderSailingActions(row.original),
      },
    ],
    [
      emptyDash,
      formatDate,
      itineraryById,
      renderSailingActions,
      shipById,
      tColumns,
      tCommon,
    ],
  );

  const sailings = state.status === 'ready' ? state.sailings : [];

  const displayedSailings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sailings.filter((sailing) => {
      const itinerary = itineraryById.get(sailing.itineraryId);
      const ship = itinerary ? shipById.get(itinerary.shipId) : undefined;

      if (shipFilter && itinerary?.shipId !== shipFilter) return false;

      if (!query) return true;
      const haystack = [
        formatDate(sailing.departureDate),
        itinerary?.name ?? '',
        ship?.name ?? '',
        itinerary ? String(itinerary.durationNights) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [formatDate, itineraryById, sailings, search, shipById, shipFilter]);

  const hasActiveFilters = Boolean(search || shipFilter || itineraryFilter);
  const emptyMessage = hasActiveFilters ? t('emptyFiltered') : t('emptySailings');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteSailingTitle')}
        description={t('deleteSailingConfirm', { label: confirmLabel })}
        confirmLabel={t('deleteSailingButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="min-w-0 space-y-6">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <div className="sm:w-52">
              <Select
                label={tFilters('ship')}
                value={shipFilter}
                options={shipOptions}
                onChange={(e) => {
                  const nextShip = e.target.value;
                  setShipFilter(nextShip);
                  setPage(1);
                  if (itineraryFilter) {
                    const it = itineraryById.get(itineraryFilter);
                    if (nextShip && it && it.shipId !== nextShip) {
                      setItineraryFilter('');
                    }
                  }
                }}
              />
            </div>
            <div className="sm:w-56">
              <Select
                label={tFilters('itinerary')}
                value={itineraryFilter}
                options={itineraryOptions}
                onChange={(e) => {
                  setItineraryFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ListViewModeToggle
              value={viewMode}
              options={viewModeOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeAria')}
            />
          </div>
          <Button href="/produits/croisieres/nouveau" className="lg:hidden">
            {t('newSailing')}
          </Button>
        </div>

        {viewMode === 'calendar' ? (
          <SailingsCalendarView itineraryById={itineraryById} shipById={shipById} />
        ) : state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={displayedSailings}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={hasActiveFilters ? 'search' : 'default'}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tCommon('pagination.sailing')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tDataTable('loading')}</p>
        ) : displayedSailings.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {displayedSailings.map((sailing) => {
                const itinerary = itineraryById.get(sailing.itineraryId);
                const ship = itinerary ? shipById.get(itinerary.shipId) : undefined;
                const label =
                  itinerary?.name ?? formatDate(sailing.departureDate) ?? t('fallbackDeparture');
                return (
                  <li key={sailing.id} className="min-w-0">
                    <Card variant="dashboard" className="flex h-full flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <ShipThumbnail
                          shipId={ship?.id}
                          label={ship?.name ?? label}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="tabular-nums text-sm font-semibold text-atg-fg">
                            {formatDate(sailing.departureDate)}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-atg-fg">
                            {itinerary?.name ?? emptyDash}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-atg-muted">
                            {ship?.name ?? emptyDash}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 rounded-lg bg-atg-surface/50 px-3 py-2">
                        <span className="text-xs text-atg-muted">{tColumns('nights')}</span>
                        {itinerary?.durationNights != null ? (
                          <DataTableBadge variant="muted">
                            {itinerary.durationNights}
                          </DataTableBadge>
                        ) : (
                          <span className="text-sm text-atg-muted">{emptyDash}</span>
                        )}
                      </div>
                      <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                        {renderSailingActions(sailing)}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tCommon('pagination.sailing')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
