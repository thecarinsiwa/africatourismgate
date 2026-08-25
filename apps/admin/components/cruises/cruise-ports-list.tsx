'use client';

import { useAdminErrorMessages } from '../../lib/i18n/use-admin-error-messages';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTableBadge,
  DataTablePagination,
  Input,
  Modal,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { CruisePort } from '@africatourismgate/types';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { useDataTablePaginationLabels } from '../../lib/i18n/use-pagination-labels';
import { ListViewModeToggle } from '../list-view-mode-toggle';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

type FormValues = { code: string; name: string; countryCode: string };
type ViewMode = 'grid' | 'table';
const emptyForm: FormValues = { code: '', name: '', countryCode: '' };

export function CruisePortsList() {
  const { croisieres: getCroisieresErrorMessage } = useAdminErrorMessages();
  const t = useTranslations('modules.cruises.referential.ports');
  const tCommon = useTranslations('modules.common');
  const tPagination = useTranslations('modules.common.pagination');
  const tActions = useTranslations('common.actions');
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

  const viewModeOptions = useMemo(
    () => [
      { value: 'grid' as const, label: t('viewGrid') },
      { value: 'table' as const, label: t('viewTable') },
    ],
    [t],
  );

  function openForm(port?: CruisePort) {
    if (port) {
      setEditing(port);
      setFormValues({
        code: port.code,
        name: port.name,
        countryCode: port.countryCode,
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
    const code = formValues.code.trim().toUpperCase();
    const name = formValues.name.trim();
    const countryCode = formValues.countryCode.trim().toUpperCase();
    if (!code || !name || countryCode.length !== 2) {
      setFormError(t('validation'));
      return;
    }
    setSubmitting(true);
    try {
      const body = { code, name, countryCode };
      if (editing) {
        await getApiClient().updateCruisePort(editing.id, body);
        toast({ variant: 'success', title: tToast('saved'), message: name });
      } else {
        await getApiClient().createCruisePort(body);
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
      toast({ variant: 'success', title: tToast('deleted'), message: port.name });
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
    (port: CruisePort) => (
      <DataTableActions>
        <DataTableActionButton action="edit" onClick={() => openForm(port)} />
        <DataTableActionButton
          action="delete"
          onClick={() => handleDeleteRequest(port)}
          disabled={deletingId === port.id}
          loading={deletingId === port.id}
        />
      </DataTableActions>
    ),
    [deletingId, handleDeleteRequest],
  );

  const columns = useMemo<ColumnDef<CruisePort, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t('code'),
        cell: ({ row }) => (
          <code className="rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs">
            {row.original.code}
          </code>
        ),
      },
      { accessorKey: 'name', header: t('port') },
      {
        accessorKey: 'countryCode',
        header: t('country'),
        cell: ({ row }) => (
          <DataTableBadge variant="muted">{row.original.countryCode}</DataTableBadge>
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

  const ports = state.status === 'ready' ? state.ports : [];
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('code')}
                value={formValues.code}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                disabled={submitting}
                required
              />
              <Input
                label={t('country')}
                value={formValues.countryCode}
                onChange={(e) =>
                  setFormValues((p) => ({
                    ...p,
                    countryCode: e.target.value.toUpperCase().slice(0, 2),
                  }))
                }
                maxLength={2}
                disabled={submitting}
                required
              />
            </div>
            <Input
              label={t('port')}
              value={formValues.name}
              onChange={(e) =>
                setFormValues((p) => ({ ...p, name: e.target.value }))
              }
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
        ) : viewMode === 'table' ? (
          <>
            <Card variant="dashboard" padding="none" className="overflow-hidden">
              <DataTable
                columns={columns}
                data={ports}
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
                itemLabel={tPagination('port')}
                labels={paginationLabels}
                onPageChange={setPage}
              />
            ) : null}
          </>
        ) : state.status === 'loading' ? (
          <p className="text-sm text-atg-muted">{tCommon('loading')}</p>
        ) : ports.length === 0 ? (
          <p className="text-sm text-atg-muted">{emptyMessage}</p>
        ) : (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {ports.map((port) => (
                <li key={port.id}>
                  <Card variant="dashboard" className="flex h-full flex-col gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded bg-atg-surface px-1.5 py-0.5 font-mono text-xs">
                          {port.code}
                        </code>
                        <DataTableBadge variant="muted">{port.countryCode}</DataTableBadge>
                      </div>
                      <p className="mt-2 truncate font-medium text-atg-fg">{port.name}</p>
                    </div>
                    <div className="mt-auto flex justify-end border-t border-atg-border pt-3">
                      {renderActions(port)}
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
                itemLabel={tPagination('port')}
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
