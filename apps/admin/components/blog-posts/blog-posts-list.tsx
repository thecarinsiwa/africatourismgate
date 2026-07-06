'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
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
import type { BlogPost, BlogPostStatus } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

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

export function BlogPostsList() {
  const { blog: getBlogErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.blog.list');
  const tStatus = useTranslations('modules.blog.status');
  const tLocale = useTranslations('modules.blog.locale');
  const tCommon = useTranslations('modules.common');
  const statusFilterId = useId();
  const localeFilterId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'' | BlogPostStatus>('');
  const [localeFilter, setLocaleFilter] = useState('');
  const [filterTick, setFilterTick] = useState(0);
  const [canWrite, setCanWrite] = useState(false);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; posts: BlogPost[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('blog.write'));
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
      const result = await getApiClient().listBlogPosts({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter || undefined,
        locale: localeFilter || undefined,
      });
      setState({
        status: 'ready',
        posts: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getBlogErrorMessage(error) });
    }
  }, [page, search, statusFilter, localeFilter, filterTick, getBlogErrorMessage]);

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

  const handleDelete = useCallback(
    async (post: BlogPost) => {
      if (!window.confirm(t('deleteConfirm', { title: post.title }))) return;
      setDeleteError(null);
      setDeletingId(post.id);
      try {
        await getApiClient().deleteBlogPost(post.id);
        await load();
      } catch (error) {
        setDeleteError(getBlogErrorMessage(error));
      } finally {
        setDeletingId(null);
      }
    },
    [load, t, getBlogErrorMessage],
  );

  const columns = useMemo<ColumnDef<BlogPost, unknown>[]>(
    () => [
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
        accessorKey: 'slug',
        header: tCommon('columns.slug'),
        cell: ({ row }) => (
          <code className="rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs text-atg-fg">
            {row.original.slug}
          </code>
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
        cell: ({ row }) => {
          const post = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" href={`/contenu/blog/${post.id}`} />
              {canWrite ? (
                <DataTableActionButton
                  action="delete"
                  onClick={() => void handleDelete(post)}
                  disabled={deletingId === post.id}
                  loading={deletingId === post.id}
                />
              ) : null}
            </DataTableActions>
          );
        },
      },
    ],
    [canWrite, deletingId, handleDelete, t, tCommon, tStatus],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const posts = state.status === 'ready' ? state.posts : [];
  const emptyMessage = search.trim() ? t('emptySearch') : t('emptyDefault');
  const hasActiveFilters = Boolean(statusFilter || localeFilter);

  return (
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
          <div className="grid gap-4 sm:grid-cols-2">
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
                onChange={(e) => setStatusFilter(e.target.value as '' | BlogPostStatus)}
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
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStatusFilter('');
                setLocaleFilter('');
                setPage(1);
                setFilterTick((n) => n + 1);
              }}
            >
              {tCommon('filters.clearAll')}
            </Button>
          ) : null}
        </div>
        {canWrite ? <Button href="/contenu/blog/nouveau">{t('newButton')}</Button> : null}
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
              data={posts}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
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
  );
}
