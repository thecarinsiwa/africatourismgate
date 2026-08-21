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
import type { CruiseLine, Ship } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { ShipThumbnail } from './ship-thumbnail';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type ViewMode = 'grid' | 'table';

export function ShipsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.referential.ships');
  const tDialogs = useTranslations('modules.cruises.dialogs');
  const tNav = useTranslations('dashboard.links');
  const tCommon = useTranslations('modules.common');
  const tColumns = useTranslations('modules.cruises.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lines, setLines] = useState<CruiseLine[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ships: Ship[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Ship | null>(null);

  useEffect(() => {
    void getApiClient()
      .listCruiseLines({ page: 1, limit: 100 })
      .then((r) => setLines(r.data))
      .catch(() => setLines([]));
  }, []);

  const lineById = useMemo(() => new Map(lines.map((l) => [l.id, l.name])), [lines]);

  const lineOptions = useMemo(
    () => [
      { value: '', label: t('allLines') },
      ...lines.map((l) => ({ value: l.id, label: l.name })),
    ],
    [lines, t],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listShips({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        cruiseLineId: lineFilter || undefined,
      });
      setState({
        status: 'ready',
        ships: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [page, search, lineFilter, getCroisieresErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

  const handleDeleteRequest = useCallback((ship: Ship) => {
    setConfirmTarget(ship);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const ship = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(ship.id);
    try {
      await getApiClient().deleteShip(ship.id);
      await load();
    } catch (error) {
      setDeleteError(getCroisieresErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getCroisieresErrorMessage, load]);

  const renderActions = useCallback(
    (ship: Ship) => (
      <DataTableActions>
        <DataTableActionButton
          action="edit"
          href={`/produits/croisieres/navires/${ship.id}`}
        />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(ship)}
          disabled={deletingId === ship.id}
          loading={deletingId === ship.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

  const columns = useMemo<ColumnDef<Ship, unknown>[]>(
    () => [
      {
        id: 'thumbnail',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <ShipThumbnail shipId={row.original.id} label={row.original.name} size="sm" />
        ),
      },
      { accessorKey: 'name', header: tColumns('ship') },
      {
        id: 'line',
        header: tColumns('line'),
        cell: ({ row }) => lineById.get(row.original.cruiseLineId) ?? emptyDash,
      },
      {
        accessorKey: 'builtYear',
        header: tColumns('year'),
        cell: ({ row }) => row.original.builtYear ?? emptyDash,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [emptyDash, lineById, renderActions, tColumns, tCommon],
  );

  const ships = state.status === 'ready' ? state.ships : [];
  const hasSearch = search.trim().length > 0 || lineFilter.length > 0;
  const emptyMessage = hasSearch ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={tDialogs('deleteShipTitle')}
        description={
          confirmTarget ? tDialogs('deleteShip', { name: confirmTarget.name }) : ''
        }
        confirmLabel={tDialogs('deleteShipButton')}
        cancelLabel={tDialogs('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-xs">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select
                label={t('filterLine')}
                value={lineFilter}
                options={lineOptions}
                onChange={(e) => {
                  setLineFilter(e.target.value);
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
          <Button href="/produits/croisieres/navires/nouveau">{tNav('newShip')}</Button>
        </div>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={ships}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={hasSearch ? 'search' : 'default'}
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
                itemLabel={tPagination('ship')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : ships.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {ships.map((ship) => (
                <li key={ship.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <ShipThumbnail
                        shipId={ship.id}
                        label={ship.name}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-atg-fg">{ship.name}</p>
                        <p className="mt-1 truncate text-xs text-atg-muted">
                          {lineById.get(ship.cruiseLineId) ?? emptyDash}
                        </p>
                        {ship.builtYear ? (
                          <div className="mt-2">
                            <DataTableBadge variant="muted">{ship.builtYear}</DataTableBadge>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(ship)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('ship')}
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
