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
import type { GapMediaItem, GapMediaItemType, GapStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { GapMediaItemDetailModal } from './gap-media-item-detail-modal';
import { getApiClient } from '../../lib/auth/api';
import { GAP_MEDIA_TYPES } from '../../lib/gap/constants';
import { useGapPermissions } from '../../lib/gap/use-gap-permissions';
import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

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

export function GapMediaItemsList() {
  const { gap: getGapErrorMessage } = useAdminErrorMessages();
  const { canWrite } = useGapPermissions();
  const t = useTranslations('modules.gap.media.list');
  const tTypes = useTranslations('modules.gap.mediaTypes');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const statusFilterId = useId();
  const localeFilterId = useId();
  const mediaTypeFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | GapStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'' | GapMediaItemType>('');
  const [filterTick, setFilterTick] = useState(0);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; items: GapMediaItem[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<GapMediaItem | null>(null);
  const [viewTarget, setViewTarget] = useState<GapMediaItem | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listGapMediaItems({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
        mediaType: mediaTypeFilter || undefined,
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getGapErrorMessage(error) });
    }
  }, [page, search, statusFilter, localeFilter, mediaTypeFilter, filterTick, getGapErrorMessage]);

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

  const handleDeleteRequest = useCallback((item: GapMediaItem) => {
    setConfirmTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(item.id);
    try {
      await getApiClient().deleteGapMediaItem(item.id);
      await load();
    } catch (error) {
      setDeleteError(getGapErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getGapErrorMessage, load]);

  const columns = useMemo<ColumnDef<GapMediaItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <div className="max-w-md space-y-1">
            <p className="font-medium text-atg-fg">{row.original.title}</p>
            {row.original.description ? (
              <p className="line-clamp-2 text-sm text-atg-muted">{row.original.description}</p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'mediaType',
        header: t('columns.mediaType'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{tTypes(row.original.mediaType)}</span>
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
            <DataTableActionButton action="edit" href={`/gap/medias/${row.original.id}`} />
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
    [canWrite, deletingId, handleDeleteRequest, t, tCommon, tStatus, tTypes],
  );

  const items = state.status === 'ready' ? state.items : [];
  const hasActiveFilters = Boolean(statusFilter || localeFilter || mediaTypeFilter);

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
      <GapMediaItemDetailModal
        open={!!viewTarget}
        item={viewTarget}
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
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor={mediaTypeFilterId}
                className="mb-1 block text-xs font-medium text-atg-muted"
              >
                {t('columns.mediaType')}
              </label>
              <select
                id={mediaTypeFilterId}
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value as '' | GapMediaItemType)}
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
              >
                <option value="">{tCommon('filters.all')}</option>
                {GAP_MEDIA_TYPES.map((key) => (
                  <option key={key} value={key}>
                    {tTypes(key)}
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
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
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
                className="w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
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
        {canWrite ? <Button href="/gap/medias/nouveau">{t('newButton')}</Button> : null}
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={items}
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
