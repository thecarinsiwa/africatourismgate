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
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruisePort } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { code: string; name: string; countryCode: string };
const emptyForm: FormValues = { code: '', name: '', countryCode: '' };

export function CruisePortsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.cruises.form.port');
  const tCruise = useTranslations('modules.cruises');
  const tFilters = useTranslations('modules.cruises.filters');
  const tColumns = useTranslations('modules.common.columns');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; ports: CruisePort[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CruisePort | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CruisePort | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruisePorts({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        ports: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getCroisieresErrorMessage(error) });
    }
  }, [page, search, getCroisieresErrorMessage]);

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
    const code = formValues.code.trim();
    const name = formValues.name.trim();
    const countryCode = formValues.countryCode.trim().toUpperCase();
    if (!code || !name || countryCode.length !== 2) {
      setFormError(tForm('validation'));
      return;
    }
    setSubmitting(true);
    try {
      const body = { code, name, countryCode };
      if (editing) {
        await getApiClient().updateCruisePort(editing.id, body);
      } else {
        await getApiClient().createCruisePort(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((port: CruisePort) => {
    setConfirmTarget(port);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const port = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(port.id);
    try {
      await getApiClient().deleteCruisePort(port.id);
      await load();
    } catch (error) {
      setDeleteError(getCroisieresErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getCroisieresErrorMessage, load]);

  const columns = useMemo<ColumnDef<CruisePort, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: tColumns('code'),
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-sm">
            {row.original.code}
          </code>
        ),
      },
      { accessorKey: 'name', header: tCruise('columns.port') },
      { accessorKey: 'countryCode', header: tColumns('country') },
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
                  code: row.original.code,
                  name: row.original.name,
                  countryCode: row.original.countryCode,
                });
                setShowForm(true);
              }}
            />
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
    [deletingId, handleDeleteRequest, tColumns, tCruise, tForm],
  );

  const ports = state.status === 'ready' ? state.ports : [];

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
        title={tForm('deleteTitle')}
        description={confirmTarget ? tForm('deleteConfirm', { name: confirmTarget.name }) : ''}
        confirmLabel={tForm('deleteConfirmButton')}
        cancelLabel={tForm('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />
    <div className="space-y-6">
      <ReferentialListToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder={tFilters('searchPort')}
        ariaLabel={tActions('search')}
        action={
          !showForm ? (
            <Button type="button" onClick={() => setShowForm(true)}>
              {tForm('newShort')}
            </Button>
          ) : undefined
        }
      />

      {showForm ? (
        <Card variant="dashboard" className="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-medium">
              {editing ? tForm('edit') : tForm('new')}
            </h3>
            {formError ? (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            ) : null}
            <Input
              label={tColumns('code')}
              value={formValues.code}
              onChange={(e) => setFormValues((p) => ({ ...p, code: e.target.value }))}
              required
            />
            <Input
              label={tColumns('name')}
              value={formValues.name}
              onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <Input
              label={tForm('countryIso')}
              value={formValues.countryCode}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, countryCode: e.target.value }))
              }
              maxLength={2}
              required
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
              data={ports}
              isLoading={state.status === 'loading'}
              emptyMessage={tForm('empty')}
              getRowId={(r) => r.id}
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel={tPagination('port')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
