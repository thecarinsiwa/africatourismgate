'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { TourGuide, TourGuideStatus, TourGuideType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useTourGuideStatusLabels,
  useTourGuideTypeLabels,
} from '../../lib/i18n/use-module-labels';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type TypeFilter = '' | TourGuideType;
type StatusFilter = '' | TourGuideStatus;

const STATUS_VARIANTS: Record<TourGuideStatus, 'success' | 'muted'> = {
  active: 'success',
  inactive: 'muted',
};

export function TourGuidesList() {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.list');
  const tColumns = useTranslations('modules.tourGuides.columns');
  const tFilters = useTranslations('modules.tourGuides.filters');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const typeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const typeFilterId = useId();
  const statusFilterId = useId();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        guides: TourGuide[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listTourGuides({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setState({
        status: 'ready',
        guides: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getTourGuidesErrorMessage(error) });
    }
  }, [page, search, statusFilter, typeFilter, getTourGuidesErrorMessage]);

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

  const handleDelete = useCallback(
    async (guide: TourGuide) => {
      if (!window.confirm(t('deleteConfirm', { name: guide.displayName }))) {
        return;
      }
      setDeleteError(null);
      setDeletingId(guide.id);
      try {
        await getApiClient().deleteTourGuide(guide.id);
        await load();
      } catch (error) {
        setDeleteError(getTourGuidesErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load, t, getTourGuidesErrorMessage],
  );

  const columns = useMemo<ColumnDef<TourGuide, unknown>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: tColumns('name'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.photoUrl}
                alt=""
                className="h-9 w-9 rounded-full object-cover ring-1 ring-atg-border"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {row.original.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-atg-fg">{row.original.displayName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: tColumns('type'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{typeLabels[row.original.type]}</span>
        ),
      },
      {
        accessorKey: 'languages',
        header: tColumns('languages'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{row.original.languages.join(', ')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: tColumns('status'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={STATUS_VARIANTS[row.original.status]}>
            {statusLabels[row.original.status]}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const guide = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="edit"
                label={tActions('edit')}
                href={`/guides/${guide.id}`}
              />
              <DataTableActionButton
                action="delete"
                label={tActions('delete')}
                onClick={() => void handleDelete(guide)}
                disabled={deletingId === guide.id}
                loading={deletingId === guide.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [
      deletingId,
      handleDelete,
      statusLabels,
      tActions,
      tColumns,
      tCommon,
      typeLabels,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const guides = state.status === 'ready' ? state.guides : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1 sm:max-w-md">
          <Input
            name="search"
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={t('searchAria')}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label htmlFor={typeFilterId} className="mb-1 block text-xs font-medium text-atg-muted">
              {tFilters('type')}
            </label>
            <select
              id={typeFilterId}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as TypeFilter);
                setPage(1);
              }}
              className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">{tFilters('all')}</option>
              <option value="internal">{typeLabels.internal}</option>
              <option value="external">{typeLabels.external}</option>
            </select>
          </div>
          <div>
            <label
              htmlFor={statusFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              {tFilters('status')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg"
            >
              <option value="">{tFilters('all')}</option>
              <option value="active">{statusLabels.active}</option>
              <option value="inactive">{statusLabels.inactive}</option>
            </select>
          </div>
        </div>
      </div>

      {deleteError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      ) : null}

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={guides}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.guide')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
