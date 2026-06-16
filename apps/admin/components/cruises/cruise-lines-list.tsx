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
import type { CruiseLine } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
import { getApiClient } from '../../lib/auth/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string };
const emptyForm: FormValues = { name: '' };

export function CruiseLinesList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const tForm = useTranslations('modules.cruises.form.line');
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
    | { status: 'ready'; lines: CruiseLine[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CruiseLine | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listCruiseLines({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        lines: result.data,
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
    const name = formValues.name.trim();
    if (!name) {
      setFormError(tForm('validation'));
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await getApiClient().updateCruiseLine(editing.id, { name });
      } else {
        await getApiClient().createCruiseLine({ name });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<ColumnDef<CruiseLine, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: tColumns('line'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
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
                setFormValues({ name: row.original.name });
                setShowForm(true);
              }}
            />
            <DataTableActionButton
              action="delete"
              onClick={async () => {
                if (!window.confirm(tForm('deleteConfirm', { name: row.original.name }))) return;
                setDeletingId(row.original.id);
                try {
                  await getApiClient().deleteCruiseLine(row.original.id);
                  await load();
                } catch (error) {
                  setFormError(getCroisieresErrorMessage(error));
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
    [deletingId, getCroisieresErrorMessage, load, tColumns, tForm],
  );

  const lines = state.status === 'ready' ? state.lines : [];

  return (
    <div className="space-y-6">
      <ReferentialListToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        placeholder={tFilters('searchLine')}
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
              label={tColumns('name')}
              value={formValues.name}
              onChange={(e) => setFormValues({ name: e.target.value })}
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
              data={lines}
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
              itemLabel={tPagination('line')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
