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
import type { Destination, RentalAgency } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string; destinationId: string; address: string };

const emptyForm: FormValues = { name: '', destinationId: '', address: '' };

export function RentalAgenciesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.agencies');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tDestinations = useTranslations('modules.destinations.columns');
  const emptyDash = tCommon('empty.dash');
  const destId = useId();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; agencies: RentalAgency[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RentalAgency | null>(null);
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
      const result = await getApiClient().listRentalAgencies({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        agencies: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getLocationsErrorMessage(error) });
    }
  }, [page, search, getLocationsErrorMessage]);

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
    setSubmitting(true);
    try {
      const body = {
        name: formValues.name.trim(),
        ...(formValues.destinationId
          ? { destinationId: formValues.destinationId }
          : { destinationId: null }),
        ...(formValues.address.trim() ? { address: formValues.address.trim() } : {}),
      };
      if (editing) {
        await getApiClient().updateRentalAgency(editing.id, body);
      } else {
        await getApiClient().createRentalAgency(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<RentalAgency, unknown>[]>(
    () => [
      { accessorKey: 'name', header: t('agency') },
      {
        id: 'destination',
        header: tDestinations('destination'),
        cell: ({ row }) =>
          row.original.destinationId
            ? (destById.get(row.original.destinationId) ?? emptyDash)
            : emptyDash,
      },
      {
        accessorKey: 'address',
        header: t('address'),
        cell: ({ row }) => row.original.address ?? emptyDash,
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => (
          <DataTableActions>
            <DataTableActionButton
              action="edit"
              onClick={() => {
                setEditing(row.original);
                setFormValues({
                  name: row.original.name,
                  destinationId: row.original.destinationId ?? '',
                  address: row.original.address ?? '',
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
                  await getApiClient().deleteRentalAgency(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getLocationsErrorMessage(error));
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
    [deletingId, destById, emptyDash, load, t, tCommon, tDestinations, getLocationsErrorMessage],
  );

  const agencies = state.status === 'ready' ? state.agencies : [];
  const selectClass =
    'w-full rounded-lg border border-atg-border bg-atg-elevated px-4 py-3 text-sm text-atg-fg';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <Input
            type="search"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
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
            <h3 className="text-sm font-medium">{editing ? t('edit') : t('new')}</h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
            />
            <div>
              <label htmlFor={destId} className="mb-2 block text-sm font-medium">
                {t('destinationOptional')}
              </label>
              <select
                id={destId}
                className={selectClass}
                value={formValues.destinationId}
                onChange={(e) =>
                  setFormValues((p) => ({ ...p, destinationId: e.target.value }))
                }
              >
                <option value="">{tCommon('filters.none')}</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('address')}
              value={formValues.address}
              onChange={(e) => setFormValues((p) => ({ ...p, address: e.target.value }))}
            />
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
              data={agencies}
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
              itemLabel={tPagination('agency')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
