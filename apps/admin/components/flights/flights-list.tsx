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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Airline, Airport, Flight } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { FlightsExportDialog } from './flights-export-dialog';
import { FlightThumbnail } from './flight-thumbnail';
import { FlightTimeline } from './flight-timeline';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FlightsViewMode = 'table' | 'grid' | 'compact';

export function FlightsList() {
  const { vols: getVolsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.flights.list');
  const tColumns = useTranslations('modules.flights.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tDialogs = useTranslations('modules.flights.dialogs');
  const tExports = useTranslations('modules.flights.exports');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const paginationLabels = useDataTablePaginationLabels();
  const { toast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<FlightsViewMode>('table');
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; flights: Flight[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Flight | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [canExportBookings, setCanExportBookings] = useState(false);

  const emptyDash = tCommon('empty.dash');

  useEffect(() => {
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        setCanExportBookings(
          me.isSuperAdmin || me.permissions.includes('bookings.read'),
        );
      })
      .catch(() => setCanExportBookings(false));
  }, []);

  useEffect(() => {
    const client = getApiClient();
    void Promise.all([
      client.listAirlines({ page: 1, limit: 100 }),
      client.listAirports({ page: 1, limit: 100 }),
    ])
      .then(([a, p]) => {
        setAirlines(a.data);
        setAirports(p.data);
      })
      .catch(() => {
        setAirlines([]);
        setAirports([]);
      });
  }, []);

  const airlineById = useMemo(
    () => new Map(airlines.map((a) => [a.id, a])),
    [airlines],
  );
  const airportById = useMemo(
    () => new Map(airports.map((a) => [a.id, a])),
    [airports],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listFlights({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        flights: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getVolsErrorMessage(error) });
    }
  }, [page, search, getVolsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const flight = pendingDelete;
    setDeletingId(flight.id);
    try {
      await getApiClient().deleteFlight(flight.id);
      setPendingDelete(null);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedFlight', { flightNumber: flight.flightNumber }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getVolsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, load, toast, tToast, getVolsErrorMessage]);

  const viewModeOptions = useMemo(
    () => [
      { value: 'table' as const, label: t('viewTable') },
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'compact' as const, label: t('viewCompact') },
    ],
    [t],
  );

  const renderFlightRoute = useCallback(
    (
      flight: Flight,
      options?: { compact?: boolean; variant?: 'default' | 'compact' | 'card' },
    ) => {
      const dep = airportById.get(flight.departureAirportId) ?? null;
      const arr = airportById.get(flight.arrivalAirportId) ?? null;
      const compact = options?.compact ?? false;
      const variant = options?.variant ?? (compact ? 'compact' : 'default');
      return (
        <FlightTimeline
          compact={compact}
          variant={variant}
          departureAirport={dep}
          arrivalAirport={arr}
          departureTime={flight.departureTime}
          arrivalTime={flight.arrivalTime}
          durationMinutes={flight.durationMinutes}
          className={
            variant === 'card' ? 'min-w-0' : compact ? 'min-w-0' : 'min-w-[12rem]'
          }
        />
      );
    },
    [airportById],
  );

  const renderFlightActions = useCallback(
    (flight: Flight) => (
      <DataTableActions>
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/produits/vols/${flight.id}/voir`}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          href={`/produits/vols/${flight.id}`}
        />
        <DataTableActionButton
          action="delete"
          label={tActions('delete')}
          onClick={() => setPendingDelete(flight)}
          disabled={deletingId === flight.id}
          loading={deletingId === flight.id}
        />
      </DataTableActions>
    ),
    [deletingId, tActions],
  );

  const columns = useMemo<ColumnDef<Flight, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <FlightThumbnail
            flightId={row.original.id}
            label={row.original.flightNumber}
            size="md"
          />
        ),
      },
      {
        accessorKey: 'flightNumber',
        header: tColumns('flightNumber'),
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
            {row.original.flightNumber}
          </code>
        ),
      },
      {
        id: 'airline',
        header: tColumns('airline'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {airlineById.get(row.original.airlineId)?.name ?? emptyDash}
          </span>
        ),
      },
      {
        id: 'route',
        header: tColumns('route'),
        cell: ({ row }) => renderFlightRoute(row.original, { compact: true }),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderFlightActions(row.original),
      },
    ],
    [
      airlineById,
      emptyDash,
      renderFlightActions,
      renderFlightRoute,
      tColumns,
      tCommonColumns,
    ],
  );

  const flights = state.status === 'ready' ? state.flights : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
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
          <ListViewModeToggle
            value={viewMode}
            options={viewModeOptions}
            onChange={setViewMode}
            ariaLabel={t('viewModeAria')}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            {tExports('button')}
          </Button>
          <Button href="/produits/vols/nouveau" className="lg:hidden">
            {t('newFlight')}
          </Button>
        </div>
      </div>

      <FlightsExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        search={search}
        canExportBookings={canExportBookings}
      />

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          {viewMode === 'table' ? (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={flights}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
          ) : state.status === 'loading' ? (
            <p className="text-sm text-atg-muted">{tDataTable('loading')}</p>
          ) : flights.length === 0 ? (
            <p className="text-sm text-atg-muted">{emptyMessage}</p>
          ) : viewMode === 'grid' ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {flights.map((flight) => {
                const airline = airlineById.get(flight.airlineId);
                return (
                  <li key={flight.id} className="min-w-0">
                    <Card variant="dashboard" className="flex h-full flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <FlightThumbnail
                          flightId={flight.id}
                          label={flight.flightNumber}
                          size="md"
                        />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm font-semibold text-atg-fg ring-1 ring-atg-border/60">
                              {flight.flightNumber}
                            </code>
                            {airline?.iataCode ? (
                              <DataTableBadge variant="muted">{airline.iataCode}</DataTableBadge>
                            ) : null}
                          </div>
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-atg-fg">
                            {airline?.name ?? emptyDash}
                          </p>
                        </div>
                      </div>
                      <div className="min-h-[7.5rem] rounded-lg border border-atg-border/70 bg-atg-surface/50 p-3">
                        {renderFlightRoute(flight, { variant: 'card' })}
                      </div>
                      <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                        {renderFlightActions(flight)}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <ul className="divide-y divide-atg-border">
                {flights.map((flight) => {
                  const airline = airlineById.get(flight.airlineId);
                  return (
                    <li
                      key={flight.id}
                      className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FlightThumbnail
                          flightId={flight.id}
                          label={flight.flightNumber}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs font-semibold text-atg-fg ring-1 ring-atg-border/60">
                              {flight.flightNumber}
                            </code>
                            <span className="truncate text-sm text-atg-muted">
                              {airline?.name ?? emptyDash}
                            </span>
                          </div>
                          <div className="mt-2 max-w-xl">
                            {renderFlightRoute(flight, { compact: true })}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 justify-end">{renderFlightActions(flight)}</div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('flight')}
              labels={paginationLabels}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title={tDialogs('deleteTitle')}
        description={
          pendingDelete
            ? tDialogs('deleteDescription', { flightNumber: pendingDelete.flightNumber })
            : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
