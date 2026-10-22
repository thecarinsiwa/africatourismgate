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
import type { HappyCustomersStat, HappyCustomersStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type HappyCustomersStatsListProps = {
  locale: string;
};

export function HappyCustomersStatsList({ locale }: HappyCustomersStatsListProps) {
  const { about: getAboutErrorMessage } = useAdminErrorMessages();
  const { toast } = useToast();
  const t = useTranslations('modules.about.happyCustomers.stats.list');
  const tColors = useTranslations('modules.about.happyCustomers.colors');
  const tStatus = useTranslations('modules.about.status');
  const tCommon = useTranslations('modules.common');
  const tToast = useTranslations('modules.common.toast');
  const statusFilterId = useId();
  const searchId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | HappyCustomersStatus>('');
  const [filterTick, setFilterTick] = useState(0);
  const [canWrite, setCanWrite] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; stats: HappyCustomersStat[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<HappyCustomersStat | null>(null);

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
      const result = await getApiClient().listHappyCustomersStats({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale,
      });
      setState({
        status: 'ready',
        stats: result.data,
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

  const handleDeleteRequest = useCallback((stat: HappyCustomersStat) => {
    setConfirmTarget(stat);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const stat = confirmTarget;
    setConfirmTarget(null);
    setDeletingId(stat.id);
    try {
      await getApiClient().deleteHappyCustomersStat(stat.id);
      toast({ variant: 'success', message: tToast('deleted') });
      await load();
    } catch (error) {
      toast({ variant: 'error', message: getAboutErrorMessage(error) });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getAboutErrorMessage, load, tToast, toast]);

  const handleMove = useCallback(
    async (stat: HappyCustomersStat, direction: 'up' | 'down') => {
      if (state.status !== 'ready') return;
      const sorted = [...state.stats].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = sorted.findIndex((row) => row.id === stat.id);
      const neighborIndex = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || neighborIndex < 0 || neighborIndex >= sorted.length) return;

      const neighbor = sorted[neighborIndex];
      setReorderingId(stat.id);
      try {
        const client = getApiClient();
        await Promise.all([
          client.updateHappyCustomersStat(stat.id, { sortOrder: neighbor.sortOrder }),
          client.updateHappyCustomersStat(neighbor.id, { sortOrder: stat.sortOrder }),
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

  const columns = useMemo<ColumnDef<HappyCustomersStat, unknown>[]>(
    () => [
      {
        accessorKey: 'label',
        header: t('columns.label'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.label}</span>
        ),
      },
      {
        id: 'percentValue',
        header: t('columns.percent'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="tabular-nums text-sm font-semibold text-primary">
            {row.original.percentValue}%
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
        cell: ({ row }) => {
          const stats =
            state.status === 'ready'
              ? [...state.stats].sort((a, b) => a.sortOrder - b.sortOrder)
              : [];
          const index = stats.findIndex((entry) => entry.id === row.original.id);
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
                  disabled={busy || index < 0 || index >= stats.length - 1}
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
              href={`/contenu/clients-satisfaits/${row.original.id}`}
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
      tColors,
      tCommon,
      tStatus,
    ],
  );

  const stats = state.status === 'ready' ? state.stats : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { label: confirmTarget.label }) : ''}
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
            <Button href={`/contenu/clients-satisfaits/nouveau?locale=${encodeURIComponent(locale)}`}>
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
                setStatusFilter(e.target.value as '' | HappyCustomersStatus);
                setPage(1);
                setFilterTick((n) => n + 1);
              }}
              className="rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm"
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
                data={stats}
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
