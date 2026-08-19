'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CountryFlagPlaceholder } from '../flights/country-flag-placeholder';
import { getApiClient } from '../../lib/auth/api';
import { DestinationThumbnail } from './destination-thumbnail';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function DestinationsList() {
  const { destinations: getDestinationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.destinations.list');
  const tColumns = useTranslations('modules.destinations.columns');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const tToast = useTranslations('modules.common.toast');
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        destinations: Destination[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Destination | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listDestinations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        destinations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getDestinationsErrorMessage(error) });
    }
  }, [page, search, getDestinationsErrorMessage]);

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

  const handleDeleteRequest = useCallback((destination: Destination) => {
    setConfirmTarget(destination);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const destination = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(destination.id);
    try {
      await getApiClient().deleteDestination(destination.id);
      await load();
      toast({
        variant: 'success',
        message: tToast('deletedDestination', { name: destination.name }),
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getDestinationsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getDestinationsErrorMessage, load, toast, tToast]);

  const columns = useMemo<ColumnDef<Destination, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('destination'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <DestinationThumbnail
              name={row.original.name}
              countryCode={row.original.countryCode}
              imageUrl={row.original.imageUrl}
              size="sm"
            />
            <span className="font-medium text-atg-fg">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: tCommon('columns.slug'),
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted ring-1 ring-atg-border/60">
            {row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: 'countryCode',
        header: tColumns('country'),
        meta: { align: 'center' },
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <CountryFlagPlaceholder countryCode={row.original.countryCode} className="h-8 w-8" />
            <span className="font-mono text-xs tabular-nums text-atg-muted">
              {row.original.countryCode}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isFeatured',
        header: tColumns('featured'),
        meta: { align: 'center' },
        cell: ({ row }) =>
          row.original.isFeatured ? (
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {tColumns('featured')}
            </span>
          ) : (
            <span className="text-xs text-atg-muted">—</span>
          ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const destination = row.original;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton
                action="view"
                label={tActions('view')}
                href={`/produits/destinations/${destination.id}/voir`}
              />
              <DataTableActionButton
                action="edit"
                label={tActions('edit')}
                href={`/produits/destinations/${destination.id}`}
              />
              <DataTableActionButton
                action="delete"
                label={tActions('delete')}
                onClick={() => handleDeleteRequest(destination)}
                disabled={deletingId === destination.id}
                loading={deletingId === destination.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, handleDeleteRequest, tActions, tColumns, tCommon],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const destinations = state.status === 'ready' ? state.destinations : [];
  const emptyMessage =
    search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
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

      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={destinations}
              isLoading={isLoading}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('ariaLabel')}
            />
          </Card>

          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.destination')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
