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
  Select,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, RentalAgency } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<RentalAgency | null>(null);

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

  const destinationOptions = useMemo(
    () => [
      { value: '', label: tCommon('filters.none') },
      ...destinations.map((d) => ({ value: d.id, label: d.name })),
    ],
    [destinations, tCommon],
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

  function openForm(agency?: RentalAgency) {
    if (agency) {
      setEditing(agency);
      setFormValues({
        name: agency.name,
        destinationId: agency.destinationId ?? '',
        address: agency.address ?? '',
      });
    } else {
      setEditing(null);
      setFormValues(emptyForm);
    }
    setFormError(null);
    setShowForm(true);
  }

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

  const handleDeleteRequest = useCallback((agency: RentalAgency) => {
    setConfirmTarget(agency);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const agency = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(agency.id);
    try {
      await getApiClient().deleteRentalAgency(agency.id);
      await load();
    } catch (error) {
      setDeleteError(getLocationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getLocationsErrorMessage, load]);

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
            <DataTableActionButton action="edit" onClick={() => openForm(row.original)} />
            <DataTableActionButton
              action="delete"
              onClick={() => handleDeleteRequest(row.original)}
              disabled={deletingId === row.original.id}
              loading={deletingId === row.original.id}
            />
          </DataTableActions>
        ),
      },
    ],
    [deletingId, destById, emptyDash, handleDeleteRequest, t, tCommon, tDestinations],
  );

  const agencies = state.status === 'ready' ? state.agencies : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

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
      <ReferentialListToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder={t('searchPlaceholder')}
        ariaLabel={t('searchAria')}
        action={
          <Button type="button" onClick={() => openForm()}>
            {t('new')}
          </Button>
        }
      />

      <Modal
        open={showForm}
        onOpenChange={(open) => {
          if (!open && !submitting) resetForm();
        }}
        title={editing ? t('edit') : t('new')}
        showClose
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {formError}
            </p>
          ) : null}
          <Input
            label={tCommon('columns.name')}
            value={formValues.name}
            onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
          />
          <Select
            label={t('destinationOptional')}
            value={formValues.destinationId}
            options={destinationOptions}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, destinationId: e.target.value }))
            }
          />
          <Input
            label={t('address')}
            value={formValues.address}
            onChange={(e) => setFormValues((p) => ({ ...p, address: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
              {tActions('cancel')}
            </Button>
            <Button type="submit" loading={submitting}>
              {editing ? tActions('save') : tActions('create')}
            </Button>
          </div>
        </form>
      </Modal>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none">
            <DataTable
              columns={columns}
              data={agencies}
              isLoading={state.status === 'loading'}
              emptyMessage={emptyMessage}
              emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
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
    </>
  );
}
