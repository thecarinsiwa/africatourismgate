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
  type ColumnDef,
} from '@africatourismgate/ui';
import type { AboutResource, AboutResourceStatus, AboutResourceType } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ABOUT_RESOURCE_TYPES } from '../../lib/about/constants';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

export function AboutResourcesList() {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.resources.list');
  const tTypes = useTranslations('modules.about.resourceTypes');
  const tStatus = useTranslations('modules.about.status');
  const tLocale = useTranslations('modules.about.locale');
  const tCommon = useTranslations('modules.common');
  const typeFilterId = useId();
  const statusFilterId = useId();
  const localeFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<'' | AboutResourceType>('');
  const [statusFilter, setStatusFilter] = useState<'' | AboutResourceStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filterTick, setFilterTick] = useState(0);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; resources: AboutResource[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AboutResource | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('content.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listAboutResources({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
      });
      setState({
        status: 'ready',
        resources: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getAboutErrorMessage(error) });
    }
  }, [page, search, typeFilter, statusFilter, localeFilter, filterTick, getAboutErrorMessage]);

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

  const handleDeleteRequest = useCallback((resource: AboutResource) => {
    setConfirmTarget(resource);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const resource = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(resource.id);
    try {
      await getApiClient().deleteAboutResource(resource.id);
      await load();
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, load]);

  const columns = useMemo<ColumnDef<AboutResource, unknown>[]>(
    () => [
      {
        id: 'type',
        header: t('columns.type'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-atg-fg">{tTypes(row.original.type)}</span>
        ),
      },
      {
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="font-medium text-atg-fg">{row.original.title}</p>
            {row.original.description ? (
              <p className="line-clamp-2 text-sm text-atg-muted">{row.original.description}</p>
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
        id: 'publishedAt',
        header: t('columns.publishedAt'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{formatDateTime(row.original.publishedAt)}</span>
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
            <DataTableActionButton
              action="edit"
              href={`/contenu/a-propos/ressources/${row.original.id}`}
            />
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

  const resources = state.status === 'ready' ? state.resources : [];

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
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <div className="flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            id={typeFilterId}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | AboutResourceType)}
            className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">{tCommon('filters.all')}</option>
            {ABOUT_RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {tTypes(type)}
              </option>
            ))}
          </select>
          <select
            id={statusFilterId}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | AboutResourceStatus)}
            className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">{tCommon('filters.all')}</option>
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
          <select
            id={localeFilterId}
            value={localeFilter}
            onChange={(e) => setLocaleFilter(e.target.value)}
            className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">{tCommon('filters.all')}</option>
            <option value="fr">{tLocale('fr')}</option>
            <option value="en">{tLocale('en')}</option>
            <option value="es">{tLocale('es')}</option>
          </select>
          <Button type="button" variant="outline" onClick={() => setFilterTick((n) => n + 1)}>
            {tCommon('filters.apply')}
          </Button>
        </div>
        {canWrite ? (
          <Button href="/contenu/a-propos/ressources/nouveau">{t('newButton')}</Button>
        ) : null}
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
              data={resources}
              isLoading={state.status === 'loading'}
              emptyMessage={t('emptyDefault')}
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
