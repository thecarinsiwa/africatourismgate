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
import type { CruiseLine } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { name: string };
type ViewMode = 'grid' | 'table';
const emptyForm: FormValues = { name: '' };

export function CruiseLinesList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.referential.lines');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
  const tLoading = useTranslations('common.loading');
  const tToast = useTranslations('modules.common.toast');
  const tDataTable = useTranslations('modules.common.dataTable');
  const { toast } = useToast();
  const paginationLabels = useDataTablePaginationLabels();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<CruiseLine | null>(null);

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

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

  function openForm(line?: CruiseLine) {
    if (line) {
      setEditing(line);
      setFormValues({ name: line.name });
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
    const name = formValues.name.trim();
    if (!name) {
      setFormError(t('validation'));
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await getApiClient().updateCruiseLine(editing.id, { name });
        toast({ variant: 'success', title: tToast('saved'), message: name });
      } else {
        await getApiClient().createCruiseLine({ name });
        toast({ variant: 'success', title: tToast('created'), message: name });
      }
      resetForm();
      await load();
    } catch (error) {
      setFormError(getCroisieresErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const handleDeleteRequest = useCallback((line: CruiseLine) => {
    setConfirmTarget(line);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmTarget) return;
    const line = confirmTarget;
    setConfirmTarget(null);
    setDeleteError(null);
    setDeletingId(line.id);
    try {
      await getApiClient().deleteCruiseLine(line.id);
      toast({ variant: 'success', title: tToast('deleted'), message: line.name });
      await load();
    } catch (error) {
      const message = getCroisieresErrorMessage(error);
      setDeleteError(message);
      toast({ variant: 'error', title: tToast('deleteError'), message });
    } finally {
      setDeletingId(null);
    }
  }, [confirmTarget, getCroisieresErrorMessage, load, tToast, toast]);

  const renderActions = useCallback(
    (line: CruiseLine) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(line)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(line)}
          disabled={deletingId === line.id}
          loading={deletingId === line.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

  const columns = useMemo<ColumnDef<CruiseLine, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('line'),
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        id: 'actions',
        header: tCommon('columns.actions'),
        meta: { align: 'right' },
        cell: ({ row }) => renderActions(row.original),
      },
    ],
    [renderActions, t, tCommon],
  );

  const lines = state.status === 'ready' ? state.lines : [];
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
            <Input
              label={tCommon('columns.name')}
              value={formValues.name}
              onChange={(e) => setFormValues({ name: e.target.value })}
              disabled={submitting}
              required
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
                data={lines}
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
                itemLabel={tPagination('line')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : lines.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {lines.map((line) => (
                <li key={line.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <p className="min-w-0 flex-1 truncate font-medium text-atg-fg">
                      {line.name}
                    </p>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(line)}
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
                itemLabel={tPagination('line')}
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
