'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { ActivityProvider, Destination } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
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
  const tCommon = useTranslations('modules.common');
  const tSelect = useTranslations('modules.common.select');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const destId = useId();
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
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

  const columns = useMemo<ColumnDef<ActivityProvider, unknown>[]>(
    () => [
      {
        id: 'provider',
        header: tColumns('provider'),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ActivityProviderAvatar name={row.original.name} size="sm" />
            <span className="font-medium text-atg-fg">{row.original.name}</span>
          </div>
        ),
      },
      {
        id: 'destination',
        header: tList('destination'),
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {destById.get(row.original.destinationId) ?? emptyDash}
          </span>
        ),
      },
      {
        id: 'rating',
        header: tColumns('rating'),
        meta: { align: 'center' },
        cell: () => <ActivityProviderRating />,
      },
      {
        id: 'actions',
        header: tColumns('actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  name: row.original.name,
                  destinationId: row.original.destinationId,
                });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm(t('deleteConfirm', { name: row.original.name }))) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteActivityProvider(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getActivitiesErrorMessage(error));
                } finally {
                  setDeletingId(null);
                }
              }}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, destById, emptyDash, getActivitiesErrorMessage, load, t, tColumns, tList],
  );

  const providers = state.status === 'ready' ? state.providers : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={tActions('search')}
            />
          </div>
          <div className="sm:w-56">
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
        {!showForm ? (
          <Button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            {t('new')}
          </Button>
        ) : null}
      </div>

      {showForm ? (
        <Card variant="dashboard" className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? t('edit') : t('new')}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tColumns('name')}
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
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
              >
                <option value="">{tSelect('chooseDash')}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? tActions('save') : tActions('create')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                {tActions('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={providers}
              isLoading={state.status === 'loading'}
              emptyMessage={t('empty')}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('provider')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
