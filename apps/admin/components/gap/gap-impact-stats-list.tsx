'use client';

import {
  AlertDialog,
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
} from '@africatourismgate/ui';
import type { GapImpactStat, GapStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function GapImpactStatsList() {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.impact.list');
  const tColors = useTranslations('modules.gap.colors');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | GapStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; stats: GapImpactStat[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<GapImpactStat | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listGapImpactStats({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
      });
      setState({
        status: 'ready',
        stats: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getGapErrorMessage(error) });
    }
  }, [page, search, statusFilter, localeFilter, getGapErrorMessage]);

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

  const handleDeleteRequest = useCallback((stat: GapImpactStat) => {
    setConfirmTarget(stat);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const stat = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(stat.id);
    try {
      await getApiClient().deleteGapImpactStat(stat.id);
      await load();
    } catch (error) {
      setDeleteError(getGapErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getGapErrorMessage, load]);

  const columns = useMemo<ColumnDef<GapImpactStat, unknown>[]>(
    () => [
      {
        accessorKey: 'label',
        header: t('columns.label'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'valueDisplay',
        header: t('columns.value'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-semibold text-primary">
            {row.original.valueDisplay}
          </span>
        ),
      },
      {
        id: 'colorKey',
        header: t('columns.color'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{tColors(row.original.colorKey)}</span>
        ),
      },
      {
        id: 'sortOrder',
        header: t('columns.sortOrder'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-atg-muted">{row.original.sortOrder}</span>
        ),
      },
      {
        id: 'locale',
        header: t('columns.locale'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm uppercase text-atg-muted">{row.original.locale}</span>
        ),
      },
      {
        id: 'status',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <DataTableBadge variant={row.original.status === 'published' ? 'success' : 'muted'}>
            {row.original.status === 'published' ? tStatus('published') : tStatus('draft')}
          </DataTableBadge>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton action="edit" href={`/gap/impact/${row.original.id}`} />
            {canWrite ? (
              <DataTableActionButton
                action="delete"
                onClick={() => handleDeleteRequest(row.original)}
                disabled={deletingId === row.original.id}
                loading={deletingId === row.original.id}
              />
            ) : null}
          </DataTableActions>
        ),
      },
    ],
    [canWrite, deletingId, handleDeleteRequest, t, tColors, tCommon, tStatus],
  );

  const stats = state.status === 'ready' ? state.stats : [];
  const activeFilterCount = [
    search.trim().length > 0,
    statusFilter !== '',
    localeFilter !== '',
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const statusOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      { value: 'draft', label: tStatus('draft') },
      { value: 'published', label: tStatus('published') },
    ],
    [tCommon, tStatus],
  );
  const localeOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.all') },
      { value: 'fr', label: tLocale('fr') },
      { value: 'en', label: tLocale('en') },
      { value: 'es', label: tLocale('es') },
    ],
    [tCommon, tLocale],
  );

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setLocaleFilter('');
    setPage(1);
  }, []);

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { label: confirmTarget.label }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <FilterBar
        mobileVariant="drawer"
        activeCount={activeFilterCount}
        onClear={handleClearFilters}
        clearLabel={tCommon('filters.clearAll')}
        applyLabel={tCommon('filters.apply')}
        toggleLabel={tCommon('filters.toggle')}
        filters={
          <>
            <div className="min-w-[200px] flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                label={tCommon('columns.status')}
                value={statusFilter}
                options={statusOptions}
                onChange={(e) => {
                  setStatusFilter(e.target.value as '' | GapStatus);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                label={t('columns.locale')}
                value={localeFilter}
                options={localeOptions}
                onChange={(e) => {
                  setLocaleFilter(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </>
        }
      />

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={stats}
              isLoading={state.status === 'loading'}
              emptyMessage={search.trim() ? t('emptySearch') : t('emptyDefault')}
              emptyVariant={search.trim() || hasActiveFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={t('paginationItem')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
