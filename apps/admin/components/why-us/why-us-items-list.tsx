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
import type { WhyUsItem, WhyUsItemStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type WhyUsItemsListProps = {
  locale: string;
};

export function WhyUsItemsList({ locale }: WhyUsItemsListProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.about.whyUs.items.list');
  const tIcons = useTranslations('modules.about.whyUs.icons');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const statusFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | WhyUsItemStatus>('');
  const [filterTick, setFilterTick] = useState(0);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; items: WhyUsItem[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<WhyUsItem | null>(null);

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
      const result = await getApiClient().listWhyUsItems({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale,
      });
      setState({
        status: 'ready',
        items: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getAboutErrorMessage(error) });
    }
  }, [page, search, statusFilter, locale, filterTick, getAboutErrorMessage]);

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

  const handleDeleteRequest = useCallback((item: WhyUsItem) => {
    setConfirmTarget(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const item = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(item.id);
    try {
      await getApiClient().deleteWhyUsItem(item.id);
      await load();
    } catch {
      /* reload at next load */
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, load]);

  const columns = useMemo<ColumnDef<WhyUsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-atg-fg">{row.original.title}</p>
            <p className="line-clamp-2 text-sm text-atg-muted">{row.original.description}</p>
          </div>
        ),
      },
      {
        id: 'iconKey',
        header: t('columns.icon'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">{tIcons(row.original.iconKey)}</span>
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
              href={`/contenu/pourquoi-nous/${row.original.id}`}
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
    [canWrite, deletingId, handleDeleteRequest, t, tCommon, tIcons, tStatus],
  );

  const items = state.status === 'ready' ? state.items : [];

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
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <select
            id={statusFilterId}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as '' | WhyUsItemStatus);
              setPage(1);
              setFilterTick((n) => n + 1);
            }}
            className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
          >
            <option value="">{tCommon('filters.all')}</option>
            <option value="draft">{tStatus('draft')}</option>
            <option value="published">{tStatus('published')}</option>
          </select>
        </div>

        {canWrite ? (
          <Button href={`/contenu/pourquoi-nous/nouveau?locale=${encodeURIComponent(locale)}`}>
            {t('newButton')}
          </Button>
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
              data={items}
              isLoading={state.status === 'loading'}
              emptyMessage={search ? t('emptySearch') : t('emptyDefault')}
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
