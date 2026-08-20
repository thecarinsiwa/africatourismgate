'use client';

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
  type ColumnDef,
} from '@africatourismgate/ui';
import type { GapPage, GapPageSectionKey, GapStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { GAP_PAGE_SECTION_KEYS } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { getApiClient } from '../../lib/auth/api';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';
import { GapPageDetailModal } from './gap-page-detail-modal';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function GapPagesList() {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.pages.list');
  const tSections = useTranslations('modules.gap.sections');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const statusFilterId = useId();
  const localeFilterId = useId();
  const sectionFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | GapStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'' | GapPageSectionKey>('');
  const [filterTick, setFilterTick] = useState(0);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; pages: GapPage[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<GapPage | null>(null);
  const [viewTarget, setViewTarget] = useState<GapPage | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listGapPages({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
        sectionKey: sectionFilter || undefined,
      });
      setState({
        status: 'ready',
        pages: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getGapErrorMessage(error) });
    }
  }, [page, search, statusFilter, localeFilter, sectionFilter, filterTick, getGapErrorMessage]);

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

  const handleDeleteRequest = useCallback((item: GapPage) => {
    setConfirmTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(item.id);
    try {
      await getApiClient().deleteGapPage(item.id);
      await load();
    } catch (error) {
      setDeleteError(getGapErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getGapErrorMessage, load]);

  const columns = useMemo<ColumnDef<GapPage, unknown>[]>(
    () => [
      {
        id: 'section',
        header: t('columns.section'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-atg-fg">
            {tSections(row.original.sectionKey)}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <div className="max-w-md space-y-1">
            <p className="font-medium text-atg-fg">{row.original.title}</p>
            {row.original.excerpt ? (
              <p className="line-clamp-2 text-sm text-atg-muted">{row.original.excerpt}</p>
            ) : null}
          </div>
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
        id: 'publishedAt',
        header: t('columns.publishedAt'),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm tabular-nums text-atg-muted">
            {formatDateTime(row.original.publishedAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="view"
              onClick={() => setViewTarget(row.original)}
            />
            <DataTableActionButton action="edit" href={`/gap/pages/${row.original.id}`} />
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
    [canWrite, deletingId, handleDeleteRequest, t, tCommon, tSections, tStatus],
  );

  const pages = state.status === 'ready' ? state.pages : [];
  const hasActiveFilters = Boolean(statusFilter || localeFilter || sectionFilter);

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { title: confirmTarget.title }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <GapPageDetailModal
        open={!!viewTarget}
        page={viewTarget}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
        canWrite={canWrite}
      />
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor={sectionFilterId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {t('columns.section')}
              </label>
              <select
                id={sectionFilterId}
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as '' | GapPageSectionKey)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{tCommon('filters.all')}</option>
                {GAP_PAGE_SECTION_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {tSections(key)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor={statusFilterId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {tCommon('columns.status')}
              </label>
              <select
                id={statusFilterId}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as '' | GapStatus)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{tCommon('filters.all')}</option>
                <option value="draft">{tStatus('draft')}</option>
                <option value="published">{tStatus('published')}</option>
              </select>
            </div>
            <div>
              <label
                htmlFor={localeFilterId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {t('columns.locale')}
              </label>
              <select
                id={localeFilterId}
                value={localeFilter}
                onChange={(e) => setLocaleFilter(e.target.value)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{tCommon('filters.all')}</option>
                <option value="fr">{tLocale('fr')}</option>
                <option value="en">{tLocale('en')}</option>
                <option value="es">{tLocale('es')}</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPage(1);
              setFilterTick((n) => n + 1);
            }}
          >
            {tCommon('filters.apply')}
          </Button>
        </div>
        {canWrite ? <Button href="/gap/pages/nouveau">{t('newButton')}</Button> : null}
      </div>

      {state.status === 'error' ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={pages}
              isLoading={state.status === 'loading'}
              emptyMessage={search.trim() ? t('emptySearch') : t('emptyDefault')}
              emptyVariant={search.trim() || hasActiveFilters ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('tableAria')}
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
