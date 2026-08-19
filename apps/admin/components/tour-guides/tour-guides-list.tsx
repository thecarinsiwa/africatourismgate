'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Avatar,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  FilterBar,
  Input,
  Select,
  type ColumnDef,
  useToast,
} from '@africatourismgate/ui';
import type { TourGuide, TourGuideStatus, TourGuideType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useTourGuideStatusFilterOptions,
  useTourGuideStatusLabels,
  useTourGuideTypeFilterOptions,
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

function TourGuideAvatar({ guide }: { guide: TourGuide }) {
  const user = guide.user;

  if (user) {
    return (
      <Avatar
        email={user.email}
        firstName={user.firstName}
        lastName={user.lastName}
        src={guide.photoUrl}
        size="md"
      />
    );
  }

  return (
    <Avatar
      email={`${guide.id}@guide`}
      firstName={guide.displayName}
      src={guide.photoUrl}
      size="md"
      label={guide.displayName}
    />
  );
}

export function TourGuidesList() {
  const { tourGuides: getTourGuidesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.tourGuides.list');
  const tColumns = useTranslations('modules.tourGuides.columns');
  const tFilters = useTranslations('modules.tourGuides.filters');
  const tCommon = useTranslations('modules.common');
  const tCommonFilters = useTranslations('modules.common.filters');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const typeLabels = useTourGuideTypeLabels();
  const statusLabels = useTourGuideStatusLabels();
  const typeOptions = useTourGuideTypeFilterOptions();
  const statusOptions = useTourGuideStatusFilterOptions();
  const { toast } = useToast();

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
  const [confirmTarget, setConfirmTarget] = useState<TourGuide | null>(null);

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

  const handleDeleteRequest = useCallback((guide: TourGuide) => {
    setConfirmTarget(guide);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const guide = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(guide.id);
    try {
      await getApiClient().deleteTourGuide(guide.id);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedTourGuide', { name: guide.displayName }),
      });
    } catch (error) {
      const message = getTourGuidesErrorMessage(error);
      setDeleteError(message);
      toast({
        variant: 'error',
        message,
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getTourGuidesErrorMessage, load, tToast, toast]);

  const columns = useMemo<ColumnDef<TourGuide, unknown>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: tColumns('name'),
        cell: ({ row }) => {
          const guide = row.original;
          const user = guide.user;
          return (
            <div className="flex items-center gap-3">
              <TourGuideAvatar guide={guide} />
              <div className="min-w-0">
                <span className="block truncate font-medium text-atg-fg">{guide.displayName}</span>
                {user ? (
                  <span className="block truncate text-xs text-atg-muted">{user.email}</span>
                ) : guide.type === 'external' ? (
                  <span className="block truncate text-xs text-atg-muted">
                    {typeLabels.external}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
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
                onClick={() => handleDeleteRequest(guide)}
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
      handleDeleteRequest,
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
  const activeFilterCount = [
    search.trim().length > 0,
    typeFilter !== '',
    statusFilter !== '',
  ].filter(Boolean).length;
  const hasFilters = activeFilterCount > 0;
  const emptyMessage = hasFilters ? t('emptyFiltered') : t('emptyDefault');

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setPage(1);
  }, []);

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.displayName }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <div className="space-y-6">
        <FilterBar
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
          clearLabel={tCommonFilters('clearAll')}
          toggleLabel={tCommonFilters('toggle')}
          applyLabel={tCommonFilters('apply')}
          filters={
            <>
              <div className="min-w-[200px] flex-1 sm:max-w-md">
                <Input
                  name="search"
                  type="search"
                  placeholder={t('searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label={t('searchAria')}
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  label={tFilters('type')}
                  value={typeFilter}
                  options={typeOptions}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as TypeFilter);
                    setPage(1);
                  }}
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  label={tFilters('status')}
                  value={statusFilter}
                  options={statusOptions}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                />
              </div>
            </>
          }
        />

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
                emptyVariant={hasFilters ? 'search' : 'default'}
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
    </>
  );
}
