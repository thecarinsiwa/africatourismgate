'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Modal,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { ActivityProvider, Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ActivityProviderAvatar } from './activity-provider-avatar';
import { ActivityProviderRating } from './activity-provider-rating';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string; destinationId: string };

const emptyForm: FormValues = { name: '', destinationId: '' };

export function ActivityProvidersList() {
  const { activities: getActivitiesErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.activities.referential.providers');
  const tList = useTranslations('modules.activities.list');
  const tColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tDataTable = useTranslations('modules.common.dataTable');
  const tCommon = useTranslations('modules.common');
  const tSelect = useTranslations('modules.common.select');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const emptyDash = tCommon('empty.dash');
  const destId = useId();
  const paginationLabels = useDataTablePaginationLabels();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; providers: ActivityProvider[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActivityProvider | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ActivityProvider | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getApiClient()
      .getAuthMe()
      .then((me) => {
        if (!cancelled) {
          setCanWrite(me.isSuperAdmin || me.permissions.includes('activities.write'));
        }
      })
      .catch(() => {
        if (!cancelled) setCanWrite(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

  const destById = useMemo(
    () => new Map(destinations.map((d) => [d.id, d.name])),
    [destinations],
  );

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listActivityProviders({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        destinationId: destinationFilter || undefined,
      });
      setState({
        status: 'ready',
        providers: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getActivitiesErrorMessage(error) });
    }
  }, [page, search, destinationFilter, getActivitiesErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const q = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== q) setPage(1);
        return q;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function resetForm() {
    setFormValues(emptyForm);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  }

  function openCreate() {
    if (!canWrite) return;
    setEditing(null);
    setFormValues(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(provider: ActivityProvider) {
    if (!canWrite) return;
    setEditing(provider);
    setFormValues({
      name: provider.name,
      destinationId: provider.destinationId,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canWrite) return;
    setFormError(null);
    if (!formValues.name.trim()) {
      setFormError(tCommon('validation.nameRequired'));
      return;
    }
    if (!formValues.destinationId) {
      setFormError(t('validation.destinationRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        destinationId: formValues.destinationId,
      };
      if (editing) {
        await getApiClient().updateActivityProvider(editing.id, body);
      } else {
        await getApiClient().createActivityProvider(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getActivitiesErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((provider: ActivityProvider) => {
    setConfirmTarget(provider);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget || !canWrite) return;
    const provider = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(provider.id);
    try {
      await getApiClient().deleteActivityProvider(provider.id);
      await load();
    } catch (error) {
      setDeleteError(getActivitiesErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [canWrite, confirmTarget, getActivitiesErrorMessage, load]);

  const columns = useMemo<ColumnDef<ActivityProvider, unknown>[]>(
    () => [
      {
        id: 'provider',
        header: tColumns('provider'),
        meta: { cellClassName: 'min-w-0' },
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <ActivityProviderAvatar name={row.original.name} size="sm" />
            <span className="min-w-0 truncate font-medium text-atg-fg">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: 'destination',
        header: tList('destination'),
        meta: { hideOnMobile: true },
        cell: ({ row }) => (
          <span className="block max-w-[14rem] truncate text-sm text-atg-muted">
            {destById.get(row.original.destinationId) ?? emptyDash}
          </span>
        ),
      },
      {
        id: 'rating',
        header: tColumns('rating'),
        meta: { align: 'center', hideOnMobile: true },
        cell: () => <ActivityProviderRating />,
      },
      ...(canWrite
        ? [
            {
              id: 'actions',
              header: tColumns('actions'),
              meta: { align: 'right' as const, cellClassName: 'w-[5.5rem] sm:w-auto' },
              cell: ({ row }: { row: { original: ActivityProvider } }) => (
                <DataTableActions>
                  <DataTableActionButton
                    action="edit"
                    onClick={() => openEdit(row.original)}
                  />
                  <DataTableActionButton
                    action="delete"
                    onClick={() => handleDeleteRequest(row.original)}
                    disabled={deletingId === row.original.id}
                    loading={deletingId === row.original.id}
                  />
                </DataTableActions>
              ),
            } satisfies ColumnDef<ActivityProvider, unknown>,
          ]
        : []),
    ],
    [canWrite, deletingId, destById, emptyDash, handleDeleteRequest, tColumns, tList],
  );

  const providers = state.status === 'ready' ? state.providers : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('edit') : t('new')}
        showClose={!submitting}
        closeAriaLabel={tActions('close')}
        className="max-w-lg"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tColumns('name')}
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            disabled={submitting}
            required
          />
          <div>
            <label htmlFor={destId} className="mb-2 block text-sm font-medium">
              {tList('destination')}
            </label>
            <select
              id={destId}
              className={selectClass}
              value={formValues.destinationId}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, destinationId: e.target.value }))
              }
              disabled={submitting}
              required
            >
              <option value="">{tSelect('chooseDash')}</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              {tActions('cancel')}
            </Button>
            <Button type="submit" loading={submitting} loadingText={tLoading('submit')}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="min-w-0 space-y-6 overflow-x-hidden">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 w-full flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={tActions('search')}
              />
            </div>
            <div className="min-w-0 w-full sm:w-56">
              <label className="mb-2 block text-sm font-medium text-atg-fg">
                {tList('destination')}
              </label>
              <select
                value={destinationFilter}
                onChange={(e) => {
                  setDestinationFilter(e.target.value);
                  setPage(1);
                }}
                className={selectClass}
              >
                <option value="">{tCommon('filters.allFeminine')}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {canWrite ? (
            <Button type="button" onClick={openCreate} className="w-full shrink-0 sm:w-auto">
              {t('new')}
            </Button>
          ) : null}
        </div>

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : (
          <>
            <Card variant="dashboard" padding="none" className="min-w-0 overflow-hidden">
              <DataTable
                columns={columns}
                data={providers}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={t('empty')}
                expandRowLabel={tDataTable('expandRow')}
                collapseRowLabel={tDataTable('collapseRow')}
                expandRowAriaLabel={tDataTable('expandRowAria')}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
                className="min-w-0"
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('provider')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
