'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
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
import type { Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CountryFlagPlaceholder } from '../flights/country-flag-placeholder';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { DestinationThumbnail } from './destination-thumbnail';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type DestinationsViewMode = 'grid' | 'table';
type FeaturedFilter = '' | '1' | '0';

type DestinationsListProps = {
  onChanged?: () => void;
};

function isDestinationFeatured(destination: Destination): boolean {
  return destination.isFeatured === true || Number(destination.isFeatured) === 1;
}

export function DestinationsList({ onChanged }: DestinationsListProps) {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.list');
  const tColumns = useTranslations('modules.destinations.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tPagination = useTranslations('modules.common.pagination');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<DestinationsViewMode>('grid');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        destinations: Destination[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Destination | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listDestinations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        ...(featuredFilter === '1'
          ? { isFeatured: true }
          : featuredFilter === '0'
            ? { isFeatured: false }
            : {}),
      });
      setState({
        status: 'ready',
        destinations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [page, search, featuredFilter, getDestinationsErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) {
          setPage(1);
        }
        return query;
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

  const handleDeleteRequest = useCallback((destination: Destination) => {
    setConfirmTarget(destination);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const destination = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(destination.id);
    try {
      await getApiClient().deleteDestination(destination.id);
      await load();
      onChanged?.();
      toast({
        variant: 'success',
        message: tToast('deletedDestination', { name: destination.name }),
      });
    } catch (error) {
      setDeleteError(getDestinationsErrorMessage(error));
      toast({
        variant: 'error',
        message: getDestinationsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [
    confirmTarget,
    getDestinationsErrorMessage,
    load,
    onChanged,
    toast,
    tToast,
  ]);

  const renderActions = useCallback(
    (destination: Destination) => (
      <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
        <DataTableActionButton
          action="view"
          label={tActions('view')}
          href={`/produits/destinations/${destination.id}/voir`}
        />
        <DataTableActionButton
          action="edit"
          label={tActions('edit')}
          href={`/produits/destinations/${destination.id}`}
        />
        <DataTableActionButton
          action="delete"
          label={tActions('delete')}
          onClick={() => handleDeleteRequest(destination)}
          disabled={deletingId === destination.id}
          loading={deletingId === destination.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest, tActions],
  );

  const columns = useMemo<ColumnDef<Destination, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('destination'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <DestinationThumbnail
              name={row.original.name}
              countryCode={row.original.countryCode}
              imageUrl={row.original.imageUrl}
              size="sm"
            />
            <span className="font-medium text-atg-fg">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: tCommon('columns.slug'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted ring-1 ring-atg-border/60">
            {row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: 'countryCode',
        header: tColumns('country'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <CountryFlagPlaceholder countryCode={row.original.countryCode} className="h-8 w-8" />
            <span className="font-mono text-xs tabular-nums text-atg-muted">
              {row.original.countryCode}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isFeatured',
        header: tColumns('featured'),
        meta: { align: 'center' },
        cell: ({ row }) =>
          isDestinationFeatured(row.original) ? (
            <DataTableBadge variant="success">{tColumns('featured')}</DataTableBadge>
          ) : (
            <span className="text-xs text-atg-muted">{tCommon('empty.dash')}</span>
          ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions, tColumns, tCommon],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const destinations = state.status === 'ready' ? state.destinations : [];
  const hasFilters = search.trim().length > 0 || featuredFilter !== '';
  const emptyMessage = hasFilters ? t('emptySearch') : t('emptyDefault');
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <Input
                name="search"
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <div className="min-w-0 sm:w-52">
              <label className="mb-2 block text-sm font-medium text-atg-fg">
                {t('featuredFilter')}
              </label>
              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value as FeaturedFilter);
                  setPage(1);
                }}
                className={selectClass}
                aria-label={t('featuredFilter')}
              >
                <option value="">{tCommon('filters.all')}</option>
                <option value="1">{t('featuredYes')}</option>
                <option value="0">{t('featuredNo')}</option>
              </select>
            </div>
            <ListViewModeToggle
              value={viewMode}
              options={viewModeOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeAria')}
            />
          </div>
        </div>

        {isError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={destinations}
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
                itemLabel={tPagination('destination')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : isLoading ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : destinations.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {destinations.map((destination) => (
                <li key={destination.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <DestinationThumbnail
                        name={destination.name}
                        countryCode={destination.countryCode}
                        imageUrl={destination.imageUrl}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-atg-fg">{destination.name}</p>
                        <code className="mt-0.5 inline-block rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted ring-1 ring-atg-border/60">
                          {destination.slug}
                        </code>
                        <p className="mt-1 truncate text-xs text-atg-muted">
                          {destination.countryCode}
                        </p>
                        {isDestinationFeatured(destination) ? (
                          <DataTableBadge variant="success" className="mt-2">
                            {tColumns('featured')}
                          </DataTableBadge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(destination)}
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
                itemLabel={tPagination('destination')}
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
