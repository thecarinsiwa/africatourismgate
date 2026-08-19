'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruiseLine, Ship } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { ShipThumbnail } from './ship-thumbnail';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function ShipsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises');
  const tNav = useTranslations('dashboard.links');
  const tCommon = useTranslations('modules.common');
  const tColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const emptyDash = tCommon('empty.dash');
  const lineFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [page, setPage] = useState(1);
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
      { accessorKey: 'name', header: t('columns.ship') },
      {
        id: 'line',
        header: t('columns.line'),
        cell: ({ row }) => lineById.get(row.original.cruiseLineId) ?? emptyDash,
      },
      {
        accessorKey: 'builtYear',
        header: t('columns.year'),
        cell: ({ row }) => row.original.builtYear ?? emptyDash,
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              href={`/produits/croisieres/navires/${row.original.id}`}
            />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, emptyDash, handleDeleteRequest, lineById, t, tColumns],
  );

  const ships = state.status === 'ready' ? state.ships : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('dialogs.deleteShipTitle')}
        description={confirmTarget ? t('dialogs.deleteShip', { name: confirmTarget.name }) : ''}
        confirmLabel={t('dialogs.deleteShipButton')}
        cancelLabel={t('dialogs.cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:max-w-2xl">
          <Input
            type="search"
            placeholder={t('filters.searchShip')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <select
            id={lineFilterId}
            className={selectClass}
            value={lineFilter}
            onChange={(e) => {
              setLineFilter(e.target.value);
              setPage(1);
            }}
            aria-label={t('filters.line')}
          >
            <option value="">{tCommon('filters.allFeminine')}</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <Button href="/produits/croisieres/navires/nouveau">{tNav('newShip')}</Button>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600">
          {deleteError}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={ships}
              isLoading={state.status === 'loading'}
              emptyMessage={t('list.emptyShips')}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('ship')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
