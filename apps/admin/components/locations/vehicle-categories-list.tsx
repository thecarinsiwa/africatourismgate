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
import type { VehicleCategory } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReferentialListToolbar } from '../referential-list-toolbar';
import { getApiClient } from '../../lib/auth/api';
import { getVehicleCategoryIcon } from '../../lib/vehicle-category-icon-map';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string; exampleModel: string };
const emptyForm: FormValues = { name: '', exampleModel: '' };

export function VehicleCategoriesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.categories');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const emptyDash = tCommon('empty.dash');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'ready'; categories: VehicleCategory[]; total: number; totalPages: number }
  >({ status: 'loading' });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleCategory | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<VehicleCategory | null>(null);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listVehicleCategories({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setState({
        status: 'ready',
        categories: result.data,
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

  function openForm(category?: VehicleCategory) {
    if (category) {
      setEditing(category);
      setFormValues({
        name: category.name,
        exampleModel: category.exampleModel ?? '',
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
        ...(formValues.exampleModel.trim()
          ? { exampleModel: formValues.exampleModel.trim() }
          : {}),
      };
      if (editing) {
        await getApiClient().updateVehicleCategory(editing.id, body);
      } else {
        await getApiClient().createVehicleCategory(body);
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getLocationsErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((category: VehicleCategory) => {
    setConfirmTarget(category);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const category = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(category.id);
    try {
      await getApiClient().deleteVehicleCategory(category.id);
      await load();
    } catch (error) {
      setDeleteError(getLocationsErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getLocationsErrorMessage, load]);

  const columns = useMemo<ColumnDef<VehicleCategory, unknown>[]>(
    () => [
      {
        id: 'icon',
        header: '',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-atg-surface text-primary ring-1 ring-atg-border/60">
            {getVehicleCategoryIcon(row.original.name, 'h-5 w-5')}
          </span>
        ),
      },
      { accessorKey: 'name', header: tCommon('columns.category') },
      {
        accessorKey: 'exampleModel',
        header: t('exampleModel'),
        cell: ({ row }) => row.original.exampleModel ?? emptyDash,
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
    [deletingId, emptyDash, handleDeleteRequest, t, tCommon],
  );

  const categories = state.status === 'ready' ? state.categories : [];
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
          <Input
            label={t('exampleModel')}
            value={formValues.exampleModel}
            onChange={(e) =>
              setFormValues((p) => ({ ...p, exampleModel: e.target.value }))
            }
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
              data={categories}
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
              itemLabel={tPagination('category')}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
    </>
  );
}
