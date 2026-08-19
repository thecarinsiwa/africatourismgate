'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Activity, ActivityProvider, Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import {
  ActivityDifficultyBadge,
  ActivityDurationBadge,
} from './activity-meta-badges';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatPrice(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function ActivitiesList() {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const tList = useTranslations('modules.activities.list');
  const tColumns = useTranslations('modules.activities.columns');
  const tCommonColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tCommon = useTranslations('modules.common');
  const paginationLabels = useDataTablePaginationLabels();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [providers, setProviders] = useState<ActivityProvider[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; activities: Activity[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Activity | null>(null);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
    void getApiClient()
      .listActivityProviders({ page: 1, limit: 100 })
      .then((r) => setProviders(r.data))
      .catch(() => setProviders([]));
  }, []);

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.id, p.name])),
    [providers],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivities({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        destinationId: destinationFilter || undefined,
      });
      setState({
        status: 'ready',
        activities: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [page, search, destinationFilter, getActivitiesErrorMessage]);

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

  const handleDeleteRequest = useCallback((activity: Activity) => {
    setConfirmTarget(activity);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const activity = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(activity.id);
    try {
      await getApiClient().deleteActivity(activity.id);
      await load();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getActivitiesErrorMessage, load]);

  const columns = useMemo<ColumnDef<Activity, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: tColumns('activity'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.title}</span>
        ),
      },
      {
        id: 'provider',
        header: tColumns('provider'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {providerById.get(row.original.providerId) ?? row.original.providerId}
          </span>
        ),
      },
      {
        id: 'price',
        header: tColumns('price'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">
            {formatPrice(row.original.priceCents, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'duration',
        header: tColumns('duration'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <ActivityDurationBadge durationMinutes={row.original.durationMinutes} />
        ),
      },
      {
        id: 'difficulty',
        header: tColumns('difficulty'),
        meta: { align: 'center', hideOnMobile: true },
        cell: ({ row }) => (
          <ActivityDifficultyBadge difficultyLevel={row.original.difficultyLevel} />
        ),
      },
      {
        id: 'actions',
        header: tCommonColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const activity = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton
                action="view"
                href={`/produits/activites/${activity.id}/voir`}
              />
              <DataTableActionButton action="edit" href={`/produits/activites/${activity.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => handleDeleteRequest(activity)}
                disabled={deletingId === activity.id}
                loading={deletingId === activity.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDeleteRequest, providerById, tColumns, tCommonColumns],
  );

  const activities = state.status === 'ready' ? state.activities : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tList('deleteTitle')}
        description={confirmTarget ? tList('deleteConfirm', { title: confirmTarget.title }) : ''}
        confirmLabel={tList('deleteConfirmButton')}
        cancelLabel={tList('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder={tList('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={tList('searchPlaceholder')}
          />
        </div>
        <div className="min-w-0 sm:w-56">
          <label className="mb-2 block text-sm font-medium text-atg-fg">
            {tList('destination')}
          </label>
          <select
            value={destinationFilter}
            onChange={(e) => {
              setDestinationFilter(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">{tCommon('filters.allFeminine')}</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={activities}
              isLoading={state.status === 'loading'}
              loadingMessage={tDataTable('loading')}
              emptyMessage={tList('emptyDefault')}
              expandRowLabel={tDataTable('expandRow')}
              collapseRowLabel={tDataTable('collapseRow')}
              expandRowAriaLabel={tDataTable('expandRowAria')}
              getRowId={(row) => row.id}
              aria-label={tList('ariaLabel')}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('activity')}
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
