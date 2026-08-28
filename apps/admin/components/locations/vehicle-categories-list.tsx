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
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { VehicleCategory } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { getVehicleCategoryIcon } from '../../lib/vehicle-category-icon-map';
import { ListViewModeToggle } from '../list-view-mode-toggle';
import { VehicleCategoriesStatCards } from './vehicle-categories-stat-cards';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string; exampleModel: string };
type CategoriesViewMode = 'grid' | 'table';

const emptyForm: FormValues = { name: '', exampleModel: '' };

export function VehicleCategoriesList() {
  const { locations: getLocationsErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.locations.referential.categories');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();
  const emptyDash = tCommon('empty.dash');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<CategoriesViewMode>('grid');
  const [statsKey, setStatsKey] = useState(0);
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

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

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
      const name = formValues.name.trim();
      const exampleModel = formValues.exampleModel.trim() || null;
      if (editing) {
        await getApiClient().updateVehicleCategory(editing.id, {
          name,
          exampleModel,
        });
        toast({
          variant: 'success',
          title: tToast('saved'),
          message: name,
        });
      } else {
        await getApiClient().createVehicleCategory({
          name,
          ...(exampleModel ? { exampleModel } : {}),
        });
        toast({
          variant: 'success',
          title: tToast('created'),
          message: name,
        });
      }
      resetForm();
      setStatsKey((k) => k + 1);
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
      toast({
        variant: 'success',
        title: tToast('deleted'),
        message: category.name,
      });
      setStatsKey((k) => k + 1);
      await load();
    } catch (error) {
      const message = getLocationsErrorMessage(error);
      setDeleteError(message);
      toast({ variant: 'error', title: tToast('deleteError'), message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getLocationsErrorMessage, load, tToast, toast]);

  const renderActions = useCallback(
    (category: VehicleCategory) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(category)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(category)}
          disabled={deletingId === category.id}
          loading={deletingId === category.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

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
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [emptyDash, renderActions, t, tCommon],
  );

  const categories = state.status === 'ready' ? state.categories : [];
  const emptyMessage = search.trim().length > 0 ? t('emptySearch') : t('emptyDefault');

  return (
    <>
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
        title={t('deleteTitle')}
        description={
          confirmTarget ? t('deleteConfirm', { name: confirmTarget.name }) : ''
        }
        confirmLabel={t('deleteConfirmButton')}
        cancelLabel={t('cancel')}
        variant="danger"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <div className="space-y-6">
        <VehicleCategoriesStatCards refreshKey={statsKey} />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <Input
                type="search"
                placeholder={t('searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label={t('searchAria')}
              />
            </div>
            <ListViewModeToggle
              value={viewMode}
              options={viewModeOptions}
              onChange={setViewMode}
              ariaLabel={t('viewModeAria')}
            />
          </div>
          <Button type="button" onClick={() => openForm()}>
            {t('new')}
          </Button>
        </div>

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

            <div className="flex items-center gap-3 rounded-xl border border-atg-border bg-atg-surface/50 px-4 py-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary ring-1 ring-atg-border/60">
                {getVehicleCategoryIcon(formValues.name || 'default', 'h-6 w-6')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-atg-fg">
                  {formValues.name.trim() || tCommon('columns.category')}
                </p>
                <p className="mt-0.5 truncate text-xs text-atg-muted">
                  {formValues.exampleModel.trim() || t('exampleModel')}
                </p>
              </div>
            </div>

            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, name: e.target.value }))
              }
              disabled={submitting}
              required
            />
            <Input
              label={t('exampleModel')}
              value={formValues.exampleModel}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, exampleModel: e.target.value }))
              }
              disabled={submitting}
            />
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

        {state.status === 'error' ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={categories}
                isLoading={state.status === 'loading'}
                loadingMessage={tDataTable('loading')}
                emptyMessage={emptyMessage}
                emptyVariant={search.trim().length > 0 ? 'search' : 'default'}
                getRowId={(r) => r.id}
                aria-label={t('ariaLabel')}
              />
            </Card>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('category')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary ring-1 ring-atg-border/60">
                        {getVehicleCategoryIcon(category.name, 'h-6 w-6')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-atg-fg">
                          {category.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-atg-muted">
                          {category.exampleModel ?? emptyDash}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(category)}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            {state.status === 'ready' ? (
              <DataTablePagination
                page={page}
                pageSize={PAGE_SIZE}
                totalPages={state.totalPages}
                totalItems={state.total}
                itemLabel={tPagination('category')}
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
