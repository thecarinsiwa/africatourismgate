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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { WhyUsItem, WhyUsItemStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { WhyUsIcon } from './why-us-icon';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type WhyUsItemsListProps = {
  locale: string;
};

export function WhyUsItemsList({ locale }: WhyUsItemsListProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { toast } = useToast();
  const t = useTranslations('modules.about.whyUs.items.list');
  const tIcons = useTranslations('modules.about.whyUs.icons');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tToast = useTranslations('modules.common.toast');
  const statusFilterId = useId();
  const searchId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | WhyUsItemStatus>('');
  const [filterTick, setFilterTick] = useState(0);
  const [canWrite, setCanWrite] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
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
      toast({ variant: 'success', message: tToast('deleted') });
      await load();
    } catch (error) {
      toast({ variant: 'error', message: getAboutErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getAboutErrorMessage, load, tToast, toast]);

  const handleMove = useCallback(
    async (item: WhyUsItem, direction: 'up' | 'down') => {
      if (state.status !== 'ready') return;
      const sorted = [...state.items].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = sorted.findIndex((row) => row.id === item.id);
      const neighborIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || neighborIndex < 0 || neighborIndex >= sorted.length) return;

      const neighbor = sorted[neighborIndex];
      setReorderingId(item.id);
      try {
        const client = getApiClient();
        await Promise.all([
          client.updateWhyUsItem(item.id, { sortOrder: neighbor.sortOrder }),
          client.updateWhyUsItem(neighbor.id, { sortOrder: item.sortOrder }),
        ]);
        await load();
      } catch (error) {
        toast({ variant: 'error', message: getAboutErrorMessage(error) });
      } finally {
        setReorderingId(null);
      }
    },
    [getAboutErrorMessage, load, state, toast],
  );

  const columns = useMemo<ColumnDef<WhyUsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: t('columns.title'),
        cell: ({ row }) => (
          <p className="max-w-[14rem] truncate font-medium text-atg-fg" title={row.original.title}>
            {row.original.title}
          </p>
        ),
      },
      {
        id: 'description',
        header: t('columns.description'),
        cell: ({ row }) => (
          <p
            className="max-w-xs truncate text-sm text-atg-muted"
            title={row.original.description}
          >
            {row.original.description}
          </p>
        ),
      },
      {
        id: 'iconKey',
        header: t('columns.icon'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const label = tIcons(row.original.iconKey);
          return (
            <span className="inline-flex items-center justify-center gap-2">
              <WhyUsIcon iconKey={row.original.iconKey} label={label} />
              <span className="hidden text-xs text-atg-muted sm:inline">{label}</span>
            </span>
          );
        },
      },
      {
        id: 'sortOrder',
        header: t('columns.sortOrder'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const items =
            state.status === 'ready'
              ? [...state.items].sort((a, b) => a.sortOrder - b.sortOrder)
              : [];
          const index = items.findIndex((entry) => entry.id === row.original.id);
          const busy = reorderingId === row.original.id;
          return (
            <div className="inline-flex items-center gap-1">
              {canWrite ? (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-atg-muted hover:bg-atg-muted/10 hover:text-atg-fg disabled:opacity-40"
                  aria-label={t('moveUp')}
                  disabled={busy || index <= 0}
                  onClick={() => void handleMove(row.original, 'up')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              ) : null}
              <span className="min-w-[1.5rem] text-center tabular-nums text-sm text-atg-muted">
                {row.original.sortOrder}
              </span>
              {canWrite ? (
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-atg-muted hover:bg-atg-muted/10 hover:text-atg-fg disabled:opacity-40"
                  aria-label={t('moveDown')}
                  disabled={busy || index < 0 || index >= items.length - 1}
                  onClick={() => void handleMove(row.original, 'down')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              ) : null}
            </div>
          );
        },
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
    [
      canWrite,
      deletingId,
      handleDeleteRequest,
      handleMove,
      reorderingId,
      state,
      t,
      tCommon,
      tIcons,
      tStatus,
    ],
  );

  const items = state.status === 'ready' ? state.items : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { title: confirmTarget.title }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-atg-fg">{t('heading')}</h2>
            <p className="mt-0.5 text-sm text-atg-muted">{t('description')}</p>
          </div>
          {canWrite ? (
            <Button href={`/contenu/pourquoi-nous/nouveau?locale=${encodeURIComponent(locale)}`}>
              {t('newButton')}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <label htmlFor={searchId} className="mb-1 block text-xs font-medium text-atg-muted">
              {t('searchLabel')}
            </label>
            <Input
              id={searchId}
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={t('searchLabel')}
            />
          </div>
          <div>
            <label
              htmlFor={statusFilterId}
              className="mb-1 block text-xs font-medium text-atg-muted"
            >
              {t('statusFilter')}
            </label>
            <select
              id={statusFilterId}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as '' | WhyUsItemStatus);
                setPage(1);
                setFilterTick((n) => n + 1);
              }}
              className="min-w-[10rem] rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="draft">{tStatus('draft')}</option>
              <option value="published">{tStatus('published')}</option>
            </select>
          </div>
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
