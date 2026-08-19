'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  EmptyState,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import { ApiHttpError } from '@africatourismgate/api-client';
import type { OrganizationListItem } from '@africatourismgate/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import {
  useAccountStatusLabels,
  useOrganizationLegalFormOptions,
} from '../../lib/i18n/use-module-labels';
import {
  formatOrganizationLegalForm,
  organizationStatusVariants,
} from '../../lib/organization-display';
import { OrganizationLogo } from './organization-logo';
import { OrganizationListCounts } from './organization-list-counts';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function OrganizationsList() {
  const { organizations: getOrganizationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.organizations');
  const tCommon = useTranslations('modules.common');
  const tActions = useTranslations('common.actions');
  const accountStatusLabels = useAccountStatusLabels();
  const legalFormOptions = useOrganizationLegalFormOptions();
  const emptyDash = tCommon('empty.dash');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        organizations: OrganizationListItem[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OrganizationListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listOrganizations({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        organizations: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getOrganizationsErrorMessage(error) });
    }
  }, [page, search, getOrganizationsErrorMessage]);

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

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    setDeleteError(null);
    setDeletingId(pendingDelete.id);
    try {
      await getApiClient().deleteOrganization(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 404) {
        setPendingDelete(null);
        await load();
        return;
      }
      setDeleteError(getOrganizationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [load, pendingDelete, getOrganizationsErrorMessage]);

  const columns = useMemo<ColumnDef<OrganizationListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tCommon('columns.organization'),
        cell: ({ row }) => {
          const org = row.original;
          return (
            <div className="flex items-center gap-3">
              <OrganizationLogo name={org.name} logoUrl={org.logoUrl} size="sm" />
              <div className="min-w-0">
                <Link
                  href={`/organisations/${org.id}`}
                  className="font-medium text-atg-fg hover:text-primary hover:underline"
                >
                  {org.name}
                </Link>
                <p className="truncate font-mono text-xs text-atg-muted">{org.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'type',
        header: t('list.columns.type'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-fg">
            {formatOrganizationLegalForm(row.original.legalForm, legalFormOptions, emptyDash)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: tCommon('columns.status'),
        meta: { align: 'center' },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <DataTableBadge variant={organizationStatusVariants[status]}>
              {accountStatusLabels[status]}
            </DataTableBadge>
          );
        },
      },
      {
        id: 'counts',
        header: t('list.columns.counts'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <OrganizationListCounts
            userCount={row.original.userCount}
            employeeCount={row.original.employeeCount}
            productCount={row.original.productCount}
          />
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => {
          const org = row.original;
          const busy = deletingId === org.id;
          return (
            <DataTableActions className="opacity-90 transition-opacity group-hover:opacity-100">
              <DataTableActionButton action="edit" href={`/organisations/${org.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => setPendingDelete(org)}
                disabled={busy}
                loading={busy}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [
      accountStatusLabels,
      deletingId,
      emptyDash,
      legalFormOptions,
      t,
      tCommon,
    ],
  );

  const isLoading = state.status === 'loading';
  const isError = state.status === 'error';
  const organizations = state.status === 'ready' ? state.organizations : [];
  const hasSearch = search.trim().length > 0;
  const isEmpty = state.status === 'ready' && state.total === 0;

  return (
    <div className="space-y-6">
      <div className="sm:max-w-md">
        <Input
          name="search"
          type="search"
          placeholder={tCommon('filters.searchByNameOrSlug')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label={tCommon('filters.searchByNameOrSlugAria')}
        />
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
      ) : isEmpty && !isLoading ? (
        <EmptyState
          title={
            hasSearch ? t('list.emptyTitleSearch') : t('list.emptyTitleDefault')
          }
          description={
            hasSearch ? t('list.emptyDescriptionSearch') : t('list.emptyDescriptionDefault')
          }
        />
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={organizations}
              isLoading={isLoading}
              emptyMessage={
                hasSearch ? t('list.emptyTableSearch') : t('list.emptyTableDefault')
              }
              emptyVariant={hasSearch ? 'search' : 'default'}
              getRowId={(row) => row.id}
              aria-label={t('list.ariaLabel')}
            />
          </Card>

          {state.status === 'ready' && state.totalPages > 1 ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tCommon('pagination.organization')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title={t('list.deleteDialog.title')}
        description={
          pendingDelete
            ? t('list.deleteDialog.description', { name: pendingDelete.name })
            : undefined
        }
        confirmLabel={tActions('delete')}
        cancelLabel={tActions('cancel')}
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
